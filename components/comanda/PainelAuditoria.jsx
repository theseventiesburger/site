'use client';

import { useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarAuditoria } from '@/lib/comanda/auditoria';
import { formatarDataHora } from '@/lib/comanda/formato';

const TABELAS = [
  { valor: '', label: 'Todas' },
  { valor: 'pedidos', label: 'Pedidos' },
  { valor: 'cupons', label: 'Cupons' },
  { valor: 'produtos', label: 'Produtos' },
  { valor: 'categorias', label: 'Categorias' },
  { valor: 'categorias_adicionais', label: 'Categorias de adicionais' },
  { valor: 'adicionais', label: 'Adicionais' },
  { valor: 'clientes', label: 'Clientes' },
  { valor: 'bairros', label: 'Bairros' },
];

const TABELA_LABEL = Object.fromEntries(TABELAS.map((t) => [t.valor, t.label]));

const ACAO = {
  insert: { label: 'Criou', cor: 'text-green-700 bg-green-50 border-green-200' },
  update: { label: 'Atualizou', cor: 'text-sv-blue bg-sv-blue/5 border-sv-blue/20' },
  delete: { label: 'Excluiu', cor: 'text-sv-red bg-sv-red/5 border-sv-red/20' },
};

// "total" muda sozinho a cada item do pedido (trigger de recálculo) — sem
// relevância pra auditoria, e já filtrado no banco pro update de pedidos,
// mas fica aqui também caso apareça em algum outro registro.
const CAMPOS_IGNORADOS = new Set(['updated_at', 'created_at', 'total']);

function descreverRegistro(entrada) {
  const dados = entrada.dados_novos ?? entrada.dados_antigos ?? {};
  if (entrada.tabela === 'pedidos') return `Pedido #${dados.numero ?? entrada.registro_id?.slice(0, 8)}`;
  return dados.codigo || dados.nome || entrada.registro_id || '—';
}

function camposAlterados(entrada) {
  if (entrada.acao !== 'update') return [];
  const antes = entrada.dados_antigos ?? {};
  const depois = entrada.dados_novos ?? {};
  const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)]);
  const alterados = [];
  for (const chave of chaves) {
    if (CAMPOS_IGNORADOS.has(chave)) continue;
    if (JSON.stringify(antes[chave]) !== JSON.stringify(depois[chave])) {
      alterados.push({ campo: chave, de: antes[chave], para: depois[chave] });
    }
  }
  return alterados;
}

function formatarValor(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (typeof valor === 'boolean') return valor ? 'sim' : 'não';
  return String(valor);
}

function LinhaAuditoria({ entrada }) {
  const [aberto, setAberto] = useState(false);
  const alterados = camposAlterados(entrada);
  const acao = ACAO[entrada.acao] ?? ACAO.update;
  const temDetalhe = entrada.acao !== 'update' || alterados.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${acao.cor}`}>
            {acao.label}
          </span>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {TABELA_LABEL[entrada.tabela] ?? entrada.tabela}
          </span>
          <span className="font-black text-sv-dark text-sm">{descreverRegistro(entrada)}</span>
        </div>
        <span className="text-gray-400 text-xs font-medium flex-shrink-0">{formatarDataHora(entrada.created_at)}</span>
      </div>

      <p className="text-gray-500 text-xs font-medium">
        {entrada.usuario_email ?? 'usuário removido'}
      </p>

      {temDetalhe && (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="self-start text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red"
        >
          {aberto ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>
      )}

      {aberto && (
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
          {entrada.acao === 'update' ? (
            alterados.map(({ campo, de, para }) => (
              <p key={campo} className="text-xs font-medium text-gray-600">
                <span className="font-black text-sv-dark">{campo}</span>: {formatarValor(de)} → {formatarValor(para)}
              </p>
            ))
          ) : (
            <pre className="text-[11px] text-gray-600 bg-[#F7F7F7] rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(entrada.dados_novos ?? entrada.dados_antigos, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function PainelAuditoria({ entradasIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [tabela, setTabela] = useState('');
  const [entradas, setEntradas] = useState(entradasIniciais);
  const [carregando, setCarregando] = useState(false);
  const [temMais, setTemMais] = useState(entradasIniciais.length >= 50);
  const [erro, setErro] = useState(null);

  async function filtrar(novaTabela) {
    setTabela(novaTabela);
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarAuditoria(supabase, { tabela: novaTabela || undefined });
      setEntradas(dados);
      setTemMais(dados.length >= 50);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar. Tente de novo.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarMais() {
    setCarregando(true);
    setErro(null);
    try {
      const cursor = entradas[entradas.length - 1]?.id;
      const dados = await listarAuditoria(supabase, { tabela: tabela || undefined, cursor });
      setEntradas((atual) => [...atual, ...dados]);
      setTemMais(dados.length >= 50);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar mais. Tente de novo.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABELAS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => filtrar(t.valor)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors duration-150 ${
              tabela === t.valor ? 'bg-sv-blue text-white' : 'bg-white text-gray-400 border border-gray-200 hover:text-sv-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entradas.map((entrada) => (
          <LinhaAuditoria key={entrada.id} entrada={entrada} />
        ))}
      </div>

      {entradas.length === 0 && !carregando && (
        <p className="text-gray-400 text-sm font-medium py-6 text-center">Nenhum registro de auditoria ainda.</p>
      )}

      {temMais && (
        <button
          type="button"
          onClick={carregarMais}
          disabled={carregando}
          className="self-center bg-white border border-gray-200 text-sv-dark font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs hover:border-sv-blue transition-colors duration-150 disabled:opacity-50"
        >
          {carregando ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
