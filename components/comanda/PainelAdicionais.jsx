'use client';

import { useEffect, useState } from 'react';
import { formatarBRL } from '@/lib/comanda/formato';
import {
  listarAdicionaisDoProduto,
  criarAdicional,
  atualizarAdicional,
  alternarAtivoAdicional,
} from '@/lib/comanda/adicionais';

export default function PainelAdicionais({ supabase, produtoId }) {
  const [adicionais, setAdicionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [emEdicaoId, setEmEdicaoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [precoEdicao, setPrecoEdicao] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [erro, setErro] = useState(null);

  async function recarregar() {
    const dados = await listarAdicionaisDoProduto(supabase, produtoId);
    setAdicionais(dados);
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const dados = await listarAdicionaisDoProduto(supabase, produtoId);
      if (!ativo) return;
      setAdicionais(dados);
      setCarregando(false);
    }

    carregar();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtoId]);

  async function adicionar(e) {
    e.preventDefault();
    if (!novoNome || !novoPreco) return;

    try {
      await criarAdicional(supabase, produtoId, { nome: novoNome, preco: Number(novoPreco) });
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
    setAdicionais((atual) =>
      atual.map((a) => (a.id === adicional.id ? { ...a, ativo: !a.ativo } : a))
    );
    try {
      await alternarAtivoAdicional(supabase, adicional.id, !adicional.ativo);
    } catch (err) {
      console.error(err);
      recarregar();
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-gray-100">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Adicionais</p>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {adicionais.map((adicional) => (
            <div
              key={adicional.id}
              className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                adicional.ativo ? 'border-gray-100 bg-[#F7F7F7]' : 'border-gray-200 bg-gray-100 opacity-60'
              }`}
            >
              {emEdicaoId === adicional.id ? (
                <>
                  <input
                    value={nomeEdicao}
                    onChange={(e) => setNomeEdicao(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precoEdicao}
                    onChange={(e) => setPrecoEdicao(e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => salvarEdicao(adicional.id)}
                    className="text-[10px] font-black uppercase text-sv-blue"
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs font-bold text-sv-dark truncate">{adicional.nome}</span>
                  <span className="text-xs font-black text-sv-dark">{formatarBRL(adicional.preco)}</span>
                  <button
                    type="button"
                    onClick={() => iniciarEdicao(adicional)}
                    className="text-[10px] font-black uppercase text-sv-blue"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAtivo(adicional)}
                    className={`text-[10px] font-black uppercase ${
                      adicional.ativo ? 'text-gray-400' : 'text-green-600'
                    }`}
                  >
                    {adicional.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </>
              )}
            </div>
          ))}

          {adicionais.length === 0 && (
            <p className="text-xs text-gray-400 py-1">Nenhum adicional cadastrado ainda.</p>
          )}
        </div>
      )}

      <form onSubmit={adicionar} className="flex items-center gap-2">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Ex: Bacon extra"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={novoPreco}
          onChange={(e) => setNovoPreco(e.target.value)}
          placeholder="R$"
          className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
        />
        <button
          type="submit"
          className="bg-sv-dark text-white text-[10px] font-black uppercase px-3 py-2 rounded-lg"
        >
          + Add
        </button>
      </form>

      {erro && <p className="text-sv-red text-[11px] font-bold">{erro}</p>}
    </div>
  );
}
