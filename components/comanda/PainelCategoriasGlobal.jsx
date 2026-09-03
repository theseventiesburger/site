'use client';

import { useState } from 'react';
import { criarCategoria, atualizarCategoria, alternarAtivoCategoria, listarCategorias } from '@/lib/comanda/categorias';
import { criarClienteBrowser } from '@/lib/supabase/client';

export default function PainelCategoriasGlobal({ categoriasIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [categorias, setCategorias] = useState(categoriasIniciais);
  const [emEdicaoId, setEmEdicaoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [emojiEdicao, setEmojiEdicao] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoEmoji, setNovoEmoji] = useState('');
  const [erro, setErro] = useState(null);

  async function recarregar() {
    setCategorias(await listarCategorias(supabase));
  }

  async function adicionar(e) {
    e.preventDefault();
    if (!novoNome) return;

    try {
      await criarCategoria(supabase, { nome: novoNome, emoji: novoEmoji });
      setNovoNome('');
      setNovoEmoji('');
      setErro(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível adicionar.');
    }
  }

  function iniciarEdicao(categoria) {
    setEmEdicaoId(categoria.id);
    setNomeEdicao(categoria.nome);
    setEmojiEdicao(categoria.emoji ?? '');
  }

  async function salvarEdicao(id) {
    try {
      await atualizarCategoria(supabase, id, { nome: nomeEdicao, emoji: emojiEdicao });
      setEmEdicaoId(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar.');
    }
  }

  async function toggleAtivo(categoria) {
    setCategorias((atual) => atual.map((c) => (c.id === categoria.id ? { ...c, ativo: !c.ativo } : c)));
    setErro(null);
    try {
      await alternarAtivoCategoria(supabase, categoria.id, !categoria.ativo);
    } catch (err) {
      console.error(err);
      setCategorias((atual) => atual.map((c) => (c.id === categoria.id ? { ...c, ativo: categoria.ativo } : c)));
      setErro(`Não foi possível ${categoria.ativo ? 'desativar' : 'ativar'} "${categoria.nome}". Tente de novo.`);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex flex-col gap-2">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              categoria.ativo ? 'border-gray-100 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            {emEdicaoId === categoria.id ? (
              <>
                <input
                  value={emojiEdicao}
                  onChange={(e) => setEmojiEdicao(e.target.value)}
                  className="w-14 px-2 py-2 rounded-lg border border-gray-200 text-center text-lg"
                  placeholder="🍔"
                />
                <input
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => salvarEdicao(categoria.id)}
                  className="text-xs font-black uppercase text-sv-blue"
                >
                  Salvar
                </button>
              </>
            ) : (
              <>
                <span className="text-xl">{categoria.emoji || '🍔'}</span>
                <span className="flex-1 font-bold text-sv-dark text-sm truncate">{categoria.nome}</span>
                <button
                  type="button"
                  onClick={() => iniciarEdicao(categoria)}
                  className="text-xs font-black uppercase text-sv-blue"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleAtivo(categoria)}
                  className={`text-xs font-black uppercase ${categoria.ativo ? 'text-gray-400' : 'text-green-600'}`}
                >
                  {categoria.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </>
            )}
          </div>
        ))}

        {categorias.length === 0 && (
          <p className="text-gray-400 text-sm font-medium py-6 text-center">
            Nenhuma categoria cadastrada ainda.
          </p>
        )}
      </div>

      <form onSubmit={adicionar} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-3">
        <input
          value={novoEmoji}
          onChange={(e) => setNovoEmoji(e.target.value)}
          placeholder="🍔"
          className="w-14 px-2 py-2 rounded-lg border border-gray-200 text-center text-lg"
        />
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Ex: Vegetarianos"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
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
