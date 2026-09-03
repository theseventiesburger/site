'use client';

import { useState } from 'react';
import { formatarBRL, parsePrecoInput } from '@/lib/comanda/formato';
import { criarBairro, atualizarBairro, alternarAtivoBairro, listarTodosBairros } from '@/lib/comanda/bairros';
import { criarClienteBrowser } from '@/lib/supabase/client';

export default function PainelBairros({ bairrosIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [bairros, setBairros] = useState(bairrosIniciais);
  const [emEdicaoId, setEmEdicaoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [valorEdicao, setValorEdicao] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [erro, setErro] = useState(null);

  async function recarregar() {
    setBairros(await listarTodosBairros(supabase));
  }

  async function adicionar(e) {
    e.preventDefault();
    if (!novoNome || !novoValor) return;

    try {
      await criarBairro(supabase, { nome: novoNome, valorEntrega: parsePrecoInput(novoValor) });
      setNovoNome('');
      setNovoValor('');
      setErro(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível adicionar.');
    }
  }

  function iniciarEdicao(bairro) {
    setEmEdicaoId(bairro.id);
    setNomeEdicao(bairro.nome);
    setValorEdicao(bairro.valor_entrega);
  }

  async function salvarEdicao(id) {
    try {
      await atualizarBairro(supabase, id, { nome: nomeEdicao, valorEntrega: parsePrecoInput(valorEdicao) });
      setEmEdicaoId(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar.');
    }
  }

  async function toggleAtivo(bairro) {
    setBairros((atual) => atual.map((b) => (b.id === bairro.id ? { ...b, ativo: !b.ativo } : b)));
    setErro(null);
    try {
      await alternarAtivoBairro(supabase, bairro.id, !bairro.ativo);
    } catch (err) {
      console.error(err);
      setBairros((atual) => atual.map((b) => (b.id === bairro.id ? { ...b, ativo: bairro.ativo } : b)));
      setErro(`Não foi possível ${bairro.ativo ? 'desativar' : 'ativar'} "${bairro.nome}". Tente de novo.`);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {bairros.map((bairro) => (
        <div
          key={bairro.id}
          className={`flex items-center gap-3 p-4 rounded-2xl border ${
            bairro.ativo ? 'border-gray-100 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60'
          }`}
        >
          {emEdicaoId === bairro.id ? (
            <>
              <input
                value={nomeEdicao}
                onChange={(e) => setNomeEdicao(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
              />
              <input
                type="text"
                inputMode="decimal"
                value={valorEdicao}
                onChange={(e) => setValorEdicao(e.target.value)}
                placeholder="8,00"
                className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
              />
              <button type="button" onClick={() => salvarEdicao(bairro.id)} className="text-xs font-black uppercase text-sv-blue">
                Salvar
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 font-bold text-sv-dark text-sm truncate">{bairro.nome}</span>
              <span className="font-black text-sv-dark text-sm">{formatarBRL(bairro.valor_entrega)}</span>
              <button type="button" onClick={() => iniciarEdicao(bairro)} className="text-xs font-black uppercase text-sv-blue">
                Editar
              </button>
              <button
                type="button"
                onClick={() => toggleAtivo(bairro)}
                className={`text-xs font-black uppercase ${bairro.ativo ? 'text-gray-400' : 'text-green-600'}`}
              >
                {bairro.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </>
          )}
        </div>
      ))}

      {bairros.length === 0 && (
        <p className="text-gray-400 text-sm font-medium py-6 text-center">Nenhum bairro cadastrado ainda.</p>
      )}

      <form onSubmit={adicionar} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Ex: Centro"
          className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
        />
        <input
          type="text"
          inputMode="decimal"
          value={novoValor}
          onChange={(e) => setNovoValor(e.target.value)}
          placeholder="8,00"
          className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
        />
        <button
          type="submit"
          className="bg-sv-blue hover:bg-sv-red text-white text-xs font-black uppercase px-4 py-2.5 rounded-lg transition-colors duration-150"
        >
          + Adicionar
        </button>
      </form>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}
    </div>
  );
}
