'use client';

import { useEffect, useState } from 'react';
import { listarReceita, adicionarItemReceita, removerItemReceita } from '@/lib/comanda/insumos';
import { parsePrecoInput } from '@/lib/comanda/formato';

// tipo: 'produto' | 'adicional' — ficha técnica de quanto de cada insumo
// esse item consome por unidade vendida. A baixa automática no estoque usa
// exatamente essas linhas quando o pedido é criado. Produto com tamanhos
// (ex: Nuggets 10un/20un) ganha um seletor pra montar uma ficha diferente
// por tamanho — sem escolher nenhum, é a ficha "padrão" do produto, usada
// quando o tamanho vendido não tem ficha própria (ver migration 0056).
export default function FormularioReceita({ supabase, tipo, itemId, itemNome, insumos, tamanhos = [], onFechar }) {
  const [tamanhoId, setTamanhoId] = useState(null);
  const [receita, setReceita] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [insumoId, setInsumoId] = useState(insumos[0]?.id ?? '');
  const [quantidade, setQuantidade] = useState('');
  const [erro, setErro] = useState(null);

  async function recarregar() {
    setCarregando(true);
    try {
      setReceita(await listarReceita(supabase, tipo, itemId, tamanhoId));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, tamanhoId]);

  async function adicionar(e) {
    e.preventDefault();
    if (!insumoId || !quantidade) return;

    setErro(null);
    try {
      await adicionarItemReceita(
        supabase,
        tipo,
        itemId,
        { insumoId, quantidade: parsePrecoInput(quantidade) },
        tamanhoId
      );
      setQuantidade('');
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro(err?.message?.includes('duplicate') ? 'Esse insumo já está na ficha técnica.' : 'Não foi possível adicionar.');
    }
  }

  async function remover(id) {
    try {
      await removerItemReceita(supabase, id);
      setReceita((atual) => atual.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      recarregar();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-4 my-auto">
        <div>
          <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">Ficha técnica</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">{itemNome}</p>
        </div>

        {tamanhos.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Ficha de
            </label>
            <select
              value={tamanhoId ?? ''}
              onChange={(e) => setTamanhoId(e.target.value || null)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            >
              <option value="">Padrão (qualquer tamanho sem ficha própria)</option>
              {tamanhos.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
            <p className="text-gray-400 text-[11px] font-medium">
              Sem ficha própria pro tamanho vendido, a baixa de estoque usa a Padrão.
            </p>
          </div>
        )}

        {carregando ? (
          <p className="text-gray-400 text-sm font-medium py-4 text-center">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {receita.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-[#F7F7F7]">
                <span className="flex-1 font-bold text-sv-dark text-sm truncate">{r.insumos?.nome}</span>
                <span className="text-gray-500 text-xs font-black">{r.quantidade} {r.insumos?.unidade}</span>
                <button
                  type="button"
                  onClick={() => remover(r.id)}
                  className="text-sv-red text-xs font-black uppercase tracking-wider"
                >
                  Remover
                </button>
              </div>
            ))}

            {receita.length === 0 && (
              <p className="text-gray-400 text-sm font-medium py-2 text-center">
                Nenhum insumo vinculado ainda — sem ficha técnica, esse item não baixa estoque.
              </p>
            )}
          </div>
        )}

        {insumos.length === 0 ? (
          <p className="text-gray-400 text-xs font-medium">Cadastre insumos em Cadastros → Estoque pra poder montar a ficha técnica.</p>
        ) : (
          <form onSubmit={adicionar} className="flex items-end gap-2 pt-2 border-t border-gray-100">
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insumo</label>
              <select
                value={insumoId}
                onChange={(e) => setInsumoId(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
              >
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                ))}
              </select>
            </div>
            <div className="w-24 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qtd.</label>
              <input
                type="text"
                inputMode="decimal"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="2"
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
              />
            </div>
            <button
              type="submit"
              className="bg-sv-blue hover:bg-sv-red text-white text-xs font-black uppercase px-4 py-2.5 rounded-lg transition-colors duration-150"
            >
              + Add
            </button>
          </form>
        )}

        {erro && (
          <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        <button
          type="button"
          onClick={onFechar}
          className="mt-2 py-3 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-xs"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
