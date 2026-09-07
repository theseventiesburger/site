'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarPedidosPeriodo } from '@/lib/comanda/relatorio';
import {
  formatarBRL,
  formatarDataHora,
  formatarDataDigitada,
  dataDigitadaParaISO,
  isoParaDataDigitada,
  diaComercialAtual,
  diaComercialAtras,
  diaComercialDe,
  limitesDiaComercial,
  somarDiasISO,
  horaDoDia,
} from '@/lib/comanda/formato';
import { TIPO_LABEL, STATUS_LABEL, STATUS_COR, FORMA_PAGAMENTO_LABEL } from '@/lib/comanda/constantes';

const CHAVE_HORA_ABERTURA = 'sv-relatorio-hora-abertura';
const CHAVE_HORA_FECHAMENTO = 'sv-relatorio-hora-fechamento';
const CORES_GRAFICO = ['#0026E6', '#E51212', '#F5A623', '#22C55E', '#6366F1', '#EC4899', '#06B6D4', '#1A1A1A'];

const FILTROS_RAPIDOS = [
  { chave: 'hoje', label: 'Hoje', calcular: (h) => ({ inicio: diaComercialAtual(h), fim: diaComercialAtual(h) }) },
  { chave: 'ontem', label: 'Ontem', calcular: (h) => ({ inicio: diaComercialAtras(1, h), fim: diaComercialAtras(1, h) }) },
  { chave: '7dias', label: '7 dias', calcular: (h) => ({ inicio: diaComercialAtras(6, h), fim: diaComercialAtual(h) }) },
  { chave: '30dias', label: '30 dias', calcular: (h) => ({ inicio: diaComercialAtras(29, h), fim: diaComercialAtual(h) }) },
];

// dd/mm a partir de "YYYY-MM-DD" — sem passar por Date/timezone, é só
// recorte de string (mesmo motivo do somarDiasISO: evita o problema de
// data pura formatada em fuso voltar um dia).
function diaMesCurto(dataISO) {
  return `${dataISO.slice(8, 10)}/${dataISO.slice(5, 7)}`;
}

// Sequência de horas do expediente, na ordem em que elas realmente
// acontecem — de `abertura` até (sem incluir) `fechamento`, dando a volta
// pela meia-noite quando fecha depois de abrir de novo (ex.: abre 18h,
// fecha 2h → [18,19,...,23,0,1]). abertura === fechamento vira as 24h,
// na ordem que já era o padrão antes desse controle existir.
function horasDoExpediente(abertura, fechamento) {
  const horas = [];
  let hora = abertura;
  do {
    horas.push(hora);
    hora = (hora + 1) % 24;
  } while (hora !== fechamento);
  return horas;
}

export default function PainelRelatorio({ pedidosIniciais, dataInicial }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [periodoAtivo, setPeriodoAtivo] = useState('hoje');
  const [dataInicioNegocio, setDataInicioNegocio] = useState(dataInicial);
  const [dataFimNegocio, setDataFimNegocio] = useState(dataInicial);
  const [textoInicio, setTextoInicio] = useState(isoParaDataDigitada(dataInicial));
  const [textoFim, setTextoFim] = useState(isoParaDataDigitada(dataInicial));
  const [horaAbertura, setHoraAbertura] = useState(0);
  const [horaFechamento, setHoraFechamento] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  async function buscar(inicioNegocio, fimNegocio, hv) {
    setCarregando(true);
    setErro(null);
    try {
      const { inicio } = limitesDiaComercial(inicioNegocio, hv);
      const { fim } = limitesDiaComercial(fimNegocio, hv);
      const dados = await listarPedidosPeriodo(supabase, { desde: inicio, ate: fim });
      setPedidos(dados);
      setDataInicioNegocio(inicioNegocio);
      setDataFimNegocio(fimNegocio);
      setTextoInicio(isoParaDataDigitada(inicioNegocio));
      setTextoFim(isoParaDataDigitada(fimNegocio));
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar o relatório. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  // A preferência de horário de expediente mora no navegador
  // (localStorage), não no banco — só existe depois de montar, então a
  // carga inicial do servidor sempre assume meia-noite a meia-noite e
  // corrige aqui se precisar.
  useEffect(() => {
    function lido(chave) {
      try {
        return localStorage.getItem(chave);
      } catch {
        return null;
      }
    }
    const validoOuNull = (v) => {
      const n = Number(v);
      return v !== null && Number.isInteger(n) && n >= 0 && n <= 23 ? n : null;
    };

    const abertura = validoOuNull(lido(CHAVE_HORA_ABERTURA));
    const fechamento = validoOuNull(lido(CHAVE_HORA_FECHAMENTO));
    if (fechamento !== null) setHoraFechamento(fechamento);
    if (abertura !== null && abertura !== 0) {
      setHoraAbertura(abertura);
      const { inicio, fim } = FILTROS_RAPIDOS[0].calcular(abertura);
      buscar(inicio, fim, abertura);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selecionarFiltroRapido(filtro) {
    setPeriodoAtivo(filtro.chave);
    const { inicio, fim } = filtro.calcular(horaAbertura);
    buscar(inicio, fim, horaAbertura);
  }

  function aplicarPeriodoManual() {
    const inicio = dataDigitadaParaISO(textoInicio);
    const fim = dataDigitadaParaISO(textoFim);
    if (!inicio || !fim) {
      setErro('Preencha as duas datas no formato dd/mm/aaaa.');
      return;
    }
    if (inicio > fim) {
      setErro('A data inicial não pode ser depois da data final.');
      return;
    }
    if (fim > diaComercialAtual(horaAbertura)) {
      setErro('A data final não pode ser no futuro.');
      return;
    }
    setPeriodoAtivo('manual');
    buscar(inicio, fim, horaAbertura);
  }

  function mudarHoraAbertura(e) {
    const novaHora = Number(e.target.value);
    setHoraAbertura(novaHora);
    try {
      localStorage.setItem(CHAVE_HORA_ABERTURA, String(novaHora));
    } catch {
      // idem
    }
    if (periodoAtivo === 'manual') {
      buscar(dataInicioNegocio, dataFimNegocio, novaHora);
      return;
    }
    const filtro = FILTROS_RAPIDOS.find((f) => f.chave === periodoAtivo) ?? FILTROS_RAPIDOS[0];
    const { inicio, fim } = filtro.calcular(novaHora);
    buscar(inicio, fim, novaHora);
  }

  // Fechamento só afeta a ordem das horas no gráfico "Vendas por hora" —
  // não muda os limites da consulta, então não precisa buscar de novo.
  function mudarHoraFechamento(e) {
    const novaHora = Number(e.target.value);
    setHoraFechamento(novaHora);
    try {
      localStorage.setItem(CHAVE_HORA_FECHAMENTO, String(novaHora));
    } catch {
      // idem
    }
  }

  const resumo = useMemo(() => {
    const validos = pedidos.filter((p) => p.status !== 'cancelado');
    const cancelados = pedidos.length - validos.length;
    const totalVendido = validos.reduce((soma, p) => soma + Number(p.total), 0);
    const ticketMedio = validos.length > 0 ? totalVendido / validos.length : 0;

    const porTipo = {};
    const porPagamento = {};
    const produtos = {};

    for (const pedido of validos) {
      const tipo = pedido.tipo;
      porTipo[tipo] = porTipo[tipo] ?? { quantidade: 0, total: 0 };
      porTipo[tipo].quantidade += 1;
      porTipo[tipo].total += Number(pedido.total);

      const pagamento = pedido.forma_pagamento ?? 'nao_informado';
      porPagamento[pagamento] = porPagamento[pagamento] ?? { quantidade: 0, total: 0 };
      porPagamento[pagamento].quantidade += 1;
      porPagamento[pagamento].total += Number(pedido.total);

      for (const item of pedido.itens_pedido ?? []) {
        produtos[item.nome_produto] = produtos[item.nome_produto] ?? { quantidade: 0, total: 0 };
        produtos[item.nome_produto].quantidade += item.quantidade;
        produtos[item.nome_produto].total += Number(item.subtotal);
      }
    }

    const rankingProdutos = Object.entries(produtos)
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Período de um dia comercial só → tendência por hora (mostra o
    // movimento real, mesmo que a virada faça a madrugada aparecer depois
    // da noite anterior). Mais de um dia → tendência por dia comercial.
    const umDiaSo = dataInicioNegocio === dataFimNegocio;
    let serieTemporal;
    if (umDiaSo) {
      const somaPorHora = new Map();
      for (const pedido of validos) {
        const h = horaDoDia(pedido.created_at);
        somaPorHora.set(h, (somaPorHora.get(h) ?? 0) + Number(pedido.total));
      }
      const pontos = horasDoExpediente(horaAbertura, horaFechamento).map((h) => ({
        chave: h,
        rotulo: `${String(h).padStart(2, '0')}h`,
        total: somaPorHora.get(h) ?? 0,
      }));
      serieTemporal = { titulo: 'Vendas por hora', pontos };
    } else {
      const porDia = new Map();
      for (const pedido of validos) {
        const dia = diaComercialDe(pedido.created_at, horaAbertura);
        porDia.set(dia, (porDia.get(dia) ?? 0) + Number(pedido.total));
      }
      const pontos = [];
      let cursor = dataInicioNegocio;
      while (cursor <= dataFimNegocio) {
        pontos.push({ chave: cursor, rotulo: diaMesCurto(cursor), total: porDia.get(cursor) ?? 0 });
        cursor = somarDiasISO(cursor, 1);
      }
      serieTemporal = { titulo: 'Vendas por dia', pontos };
    }

    return { validos, cancelados, totalVendido, ticketMedio, porTipo, porPagamento, rankingProdutos, serieTemporal };
  }, [pedidos, dataInicioNegocio, dataFimNegocio, horaAbertura, horaFechamento]);

  const semVendas = resumo.serieTemporal.pontos.every((p) => p.total === 0);
  const intervaloEixo = resumo.serieTemporal.pontos.length > 12 ? Math.ceil(resumo.serieTemporal.pontos.length / 12) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-wrap items-end gap-4">
        <div className="flex gap-2 flex-wrap">
          {FILTROS_RAPIDOS.map((filtro) => (
            <button
              key={filtro.chave}
              type="button"
              onClick={() => selecionarFiltroRapido(filtro)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-colors duration-150 ${
                periodoAtivo === filtro.chave
                  ? 'bg-sv-dark border-sv-dark text-white'
                  : 'border-gray-200 text-sv-dark hover:border-sv-blue hover:text-sv-blue'
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">De</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="dd/mm/aaaa"
              value={textoInicio}
              onChange={(e) => setTextoInicio(formatarDataDigitada(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue w-[130px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Até</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="dd/mm/aaaa"
              value={textoFim}
              onChange={(e) => setTextoFim(formatarDataDigitada(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue w-[130px]"
            />
          </div>
          <button
            type="button"
            onClick={aplicarPeriodoManual}
            disabled={carregando}
            className="px-5 py-2.5 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
          >
            {carregando ? 'Buscando...' : 'Filtrar'}
          </button>
        </div>

        <div className="flex items-end gap-3 ml-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Abre às</label>
            <select
              value={horaAbertura}
              onChange={mudarHoraAbertura}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:border-sv-blue"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha às</label>
            <select
              value={horaFechamento}
              onChange={mudarHoraFechamento}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:border-sv-blue"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(horaAbertura > 0 || horaFechamento > 0) && (
        <p className="text-gray-400 text-xs font-medium -mt-3 px-1">
          {horaAbertura > 0 && (
            <>
              Considerando o dia comercial de {String(horaAbertura).padStart(2, '0')}:00 até{' '}
              {String(horaAbertura).padStart(2, '0')}:00 do dia seguinte — pedido feito de madrugada antes disso
              conta como parte do dia anterior.{' '}
            </>
          )}
          Expediente de {String(horaAbertura).padStart(2, '0')}:00 às {String(horaFechamento).padStart(2, '0')}:00
          pra ordenar o gráfico de vendas por hora.
        </p>
      )}

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <CartaoResumo titulo="Total vendido" valor={formatarBRL(resumo.totalVendido)} />
        <CartaoResumo titulo="Pedidos" valor={resumo.validos.length} />
        <CartaoResumo titulo="Ticket médio" valor={formatarBRL(resumo.ticketMedio)} />
        <CartaoResumo titulo="Cancelados" valor={resumo.cancelados} />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
        <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">{resumo.serieTemporal.titulo}</h2>
        {semVendas ? (
          <p className="text-gray-400 text-xs font-medium">Sem vendas no período.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumo.serieTemporal.pontos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="rotulo"
                  interval={intervaloEixo}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                  tickFormatter={(v) => formatarBRL(v)}
                  width={72}
                />
                <Tooltip
                  formatter={(v) => formatarBRL(v)}
                  labelStyle={{ fontWeight: 700, color: '#1A1A1A' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
                />
                <Bar dataKey="total" fill="#0026E6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PainelDistribuicao
          titulo="Por tipo de pedido"
          dados={resumo.porTipo}
          rotulo={(chave) => TIPO_LABEL[chave] ?? chave}
        />
        <PainelDistribuicao
          titulo="Por forma de pagamento"
          dados={resumo.porPagamento}
          rotulo={(chave) => FORMA_PAGAMENTO_LABEL[chave] ?? 'Não informado'}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
        <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">Produtos mais vendidos</h2>
        {resumo.rankingProdutos.length === 0 ? (
          <p className="text-gray-400 text-xs font-medium">Sem itens vendidos no período.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div style={{ height: Math.max(resumo.rankingProdutos.length * 34, 120) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resumo.rankingProdutos}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={130}
                    tick={{ fontSize: 10, fill: '#1A1A1A', fontWeight: 700 }}
                    stroke="#e5e7eb"
                  />
                  <Tooltip formatter={(v) => formatarBRL(v)} contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0' }} />
                  <Bar dataKey="total" fill="#0026E6" radius={[0, 6, 6, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2">
              {resumo.rankingProdutos.map((produto, i) => (
                <div key={produto.nome} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-gray-300 font-black text-xs w-4 flex-shrink-0">{i + 1}</span>
                    <span className="font-bold text-sv-dark text-sm truncate">{produto.nome}</span>
                    <span className="text-gray-400 text-xs font-bold flex-shrink-0">× {produto.quantidade}</span>
                  </div>
                  <span className="font-black text-sv-dark text-sm flex-shrink-0">{formatarBRL(produto.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 overflow-x-auto">
        <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">Pedidos do período</h2>
        {pedidos.length === 0 ? (
          <p className="text-gray-400 text-xs font-medium">Nenhum pedido encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Pagamento</th>
                <th className="py-2 pr-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-3 font-bold text-sv-dark">{pedido.numero}</td>
                  <td className="py-2.5 pr-3 text-gray-500 font-medium">{formatarDataHora(pedido.created_at)}</td>
                  <td className="py-2.5 pr-3 text-gray-600 font-medium">{TIPO_LABEL[pedido.tipo] ?? pedido.tipo}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider ${STATUS_COR[pedido.status]}`}>
                      {STATUS_LABEL[pedido.status] ?? pedido.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600 font-medium">
                    {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] ?? 'Não informado'}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-black text-sv-dark">{formatarBRL(pedido.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CartaoResumo({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">{titulo}</p>
      <p className="text-2xl font-black text-sv-dark tracking-tight">{valor}</p>
    </div>
  );
}

function LinhaResumo({ rotulo, quantidade, total, cor }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-sv-dark flex items-center gap-2 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
        <span className="truncate">{rotulo}</span>
        <span className="text-gray-400 font-medium flex-shrink-0">· {quantidade}</span>
      </span>
      <span className="text-sm font-black text-sv-dark flex-shrink-0">{formatarBRL(total)}</span>
    </div>
  );
}

// Doughnut + legenda numérica lado a lado — usado tanto pra "tipo de
// pedido" quanto "forma de pagamento", já que os dois são só {chave:
// {quantidade, total}} agrupados.
function PainelDistribuicao({ titulo, dados, rotulo }) {
  const entradas = Object.entries(dados);
  const dadosGrafico = entradas.map(([chave, valores], i) => ({
    chave,
    nome: rotulo(chave),
    valor: valores.total,
    cor: CORES_GRAFICO[i % CORES_GRAFICO.length],
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
      <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">{titulo}</h2>
      {entradas.length === 0 ? (
        <p className="text-gray-400 text-xs font-medium">Sem pedidos no período.</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosGrafico} dataKey="valor" nameKey="nome" innerRadius="60%" outerRadius="100%" paddingAngle={2}>
                  {dadosGrafico.map((entrada) => (
                    <Cell key={entrada.chave} fill={entrada.cor} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatarBRL(v)} contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 w-full min-w-0">
            {entradas.map(([chave, valores], i) => (
              <LinhaResumo
                key={chave}
                rotulo={rotulo(chave)}
                quantidade={valores.quantidade}
                total={valores.total}
                cor={CORES_GRAFICO[i % CORES_GRAFICO.length]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
