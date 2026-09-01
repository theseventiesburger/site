'use client';

import { useState } from 'react';
import { formatarBRL } from '@/lib/comanda/formato';
import { criarAdicional, atualizarAdicional, alternarAtivoAdicional, listarTodosAdicionais } from '@/lib/comanda/adicionais';
import { criarClienteBrowser } from '@/lib/supabase/client';

export default function PainelAdicionaisGlobal({ adicionaisIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [adicionais, setAdicionais] = useState(adicionaisIniciais);
  const [emEdicaoId, setEmEdicaoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [precoEdicao, setPrecoEdicao] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [erro, setErro] = useState(null);

  async function recarregar() {
    setAdicionais(await listarTodosAdicionais(supabase));
  }

  async function adicionar(e) {
    e.preventDefault();
    if (!novoNome || !novoPreco) return;

    try {
      await criarAdicional(supabase, { nome: novoNome, preco: Number(novoPreco) });
      setNovoNome('');
      setNovoPreco('');
      setErro(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível adicionar.');
    }
  }

  function iniciarEdicao(adicional) {
    setEmEdicaoId(adicional.id);
    setNomeEdicao(adicional.nome);
    setPrecoEdicao(adicional.preco);
  }

  async function salvarEdicao(id) {
    try {
      await atualizarAdicional(supabase, id, { nome: nomeEdicao, preco: Number(precoEdicao) });
      setEmEdicaoId(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar.');
    }
  }

  async function toggleAtivo(adicional) {
    setAdicionais((atual) => atual.map((a) => (a.id === adicional.id ? { ...a, ativo: !a.ativo } : a)));
    try {
      await alternarAtivoAdicional(supabase, adicional.id, !adicional.ativo);
    } catch (err) {
      console.error(err);
      recarregar();
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex flex-col gap-2">
        {adicionais.map((adicional) => (
          <div
            key={adicional.id}
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              adicional.ativo ? 'border-gray-100 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            {emEdicaoId === adicional.id ? (
              <>
                <input
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoEdicao}
                  onChange={(e) => setPrecoEdicao(e.target.value)}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => salvarEdicao(adicional.id)}
                  className="text-xs font-black uppercase text-sv-blue"
                >
                  Salvar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-bold text-sv-dark text-sm truncate">{adicional.nome}</span>
                <span className="font-black text-sv-dark text-sm">{formatarBRL(adicional.preco)}</span>
                <button
                  type="button"
                  onClick={() => iniciarEdicao(adicional)}
                  className="text-xs font-black uppercase text-sv-blue"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleAtivo(adicional)}
                  className={`text-xs font-black uppercase ${adicional.ativo ? 'text-gray-400' : 'text-green-600'}`}
                >
                  {adicional.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </>
            )}
          </div>
        ))}

        {adicionais.length === 0 && (
          <p className="text-gray-400 text-sm font-medium py-6 text-center">
            Nenhum adicional cadastrado ainda.
          </p>
        )}
      </div>

      <form onSubmit={adicionar} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-3">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Ex: Bacon extra"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={novoPreco}
          onChange={(e) => setNovoPreco(e.target.value)}
          placeholder="R$"
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
