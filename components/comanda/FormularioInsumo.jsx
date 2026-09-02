'use client';

import { useState } from 'react';
import { criarInsumo, atualizarInsumo } from '@/lib/comanda/insumos';
import { parsePrecoInput } from '@/lib/comanda/formato';

const UNIDADES = ['un', 'fatia', 'g', 'kg', 'ml', 'L'];

export default function FormularioInsumo({ supabase, insumo, onFechar, onSalvo }) {
  const modoEdicao = Boolean(insumo);

  const [nome, setNome] = useState(insumo?.nome ?? '');
  const [unidade, setUnidade] = useState(insumo?.unidade ?? UNIDADES[0]);
  const [estoqueMinimo, setEstoqueMinimo] = useState(insumo?.estoque_minimo ?? '');
  const [estoqueInicial, setEstoqueInicial] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar(e) {
    e.preventDefault();
    if (!nome || !unidade) {
      setErro('Preencha o nome e a unidade.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const dados = {
        nome,
        unidade,
        estoqueMinimo: estoqueMinimo ? parsePrecoInput(estoqueMinimo) : 0,
        estoqueInicial: estoqueInicial ? parsePrecoInput(estoqueInicial) : 0,
      };

      if (modoEdicao) {
        await atualizarInsumo(supabase, insumo.id, dados);
      } else {
        await criarInsumo(supabase, dados);
      }

      onSalvo();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <form
        onSubmit={salvar}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 flex flex-col gap-4 my-auto"
      >
        <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">
          {modoEdicao ? 'Editar insumo' : 'Novo insumo'}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Queijo mussarela (fatia)"
            required
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Unidade</label>
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Estoque mínimo</label>
            <input
              type="text"
              inputMode="decimal"
              value={estoqueMinimo}
              onChange={(e) => setEstoqueMinimo(e.target.value)}
              placeholder="0"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
        </div>

        {!modoEdicao && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Estoque inicial (opcional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={estoqueInicial}
              onChange={(e) => setEstoqueInicial(e.target.value)}
              placeholder="0"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
        )}

        {erro && (
          <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="flex-1 py-3 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
          >
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
