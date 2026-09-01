'use client';

import { useMemo, useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarPedidosPeriodo } from '@/lib/comanda/relatorio';
import { formatarBRL, formatarDataHora, dataHojeSP, dataAtrasSP } from '@/lib/comanda/formato';
import { TIPO_LABEL, STATUS_LABEL, STATUS_COR, FORMA_PAGAMENTO_LABEL } from '@/lib/comanda/constantes';

const FILTROS_RAPIDOS = [
  { label: 'Hoje', calcular: () => ({ inicio: dataHojeSP(), fim: dataHojeSP() }) },
  { label: 'Ontem', calcular: () => ({ inicio: dataAtrasSP(1), fim: dataAtrasSP(1) }) },
  { label: '7 dias', calcular: () => ({ inicio: dataAtrasSP(6), fim: dataHojeSP() }) },
  { label: '30 dias', calcular: () => ({ inicio: dataAtrasSP(29), fim: dataHojeSP() }) },
];

export default function PainelRelatorio({ pedidosIniciais, dataInicial }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [dataInicio, setDataInicio] = useState(dataInicial);
  const [dataFim, setDataFim] = useState(dataInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  async function buscar(inicio, fim) {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarPedidosPeriodo(supabase, { inicio, fim });
      setPedidos(dados);
      setDataInicio(inicio);
      setDataFim(fim);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar o relatório. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function aplicarPeriodoManual() {
    if (!dataInicio || !dataFim) return;
    buscar(dataInicio, dataFim);
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

    return { validos, cancelados, totalVendido, ticketMedio, porTipo, porPagamento, rankingProdutos };
  }, [pedidos]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-wrap items-end gap-4">
        <div className="flex gap-2 flex-wrap">
          {FILTROS_RAPIDOS.map((filtro) => (
            <button
              key={filtro.label}
              type="button"
              onClick={() => {
                const { inicio, fim } = filtro.calcular();
                buscar(inicio, fim);
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-wider text-sv-dark hover:border-sv-blue hover:text-sv-blue transition-colors duration-150"
            >
              {filtro.label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">De</label>
            <input
              type="date"
              value={dataInicio}
              max={dataFim}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Até</label>
            <input
              type="date"
              value={dataFim}
              min={dataInicio}
              max={dataHojeSP()}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
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
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">Por tipo de pedido</h2>
          <div className="flex flex-col gap-3">
            {Object.keys(resumo.porTipo).length === 0 && (
              <p className="text-gray-400 text-xs font-medium">Sem pedidos no período.</p>
            )}
            {Object.entries(resumo.porTipo).map(([tipo, dados]) => (
              <LinhaResumo
                key={tipo}
                rotulo={TIPO_LABEL[tipo] ?? tipo}
                quantidade={dados.quantidade}
                total={dados.total}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">Por forma de pagamento</h2>
          <div className="flex flex-col gap-3">
            {Object.keys(resumo.porPagamento).length === 0 && (
              <p className="text-gray-400 text-xs font-medium">Sem pedidos no período.</p>
            )}
            {Object.entries(resumo.porPagamento).map(([forma, dados]) => (
              <LinhaResumo
                key={forma}
                rotulo={FORMA_PAGAMENTO_LABEL[forma] ?? 'Não informado'}
                quantidade={dados.quantidade}
                total={dados.total}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
        <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">Produtos mais vendidos</h2>
        {resumo.rankingProdutos.length === 0 ? (
          <p className="text-gray-400 text-xs font-medium">Sem itens vendidos no período.</p>
        ) : (
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

function LinhaResumo({ rotulo, quantidade, total }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-sv-dark">
        {rotulo} <span className="text-gray-400 font-medium">· {quantidade}</span>
      </span>
      <span className="text-sm font-black text-sv-dark">{formatarBRL(total)}</span>
    </div>
  );
}
