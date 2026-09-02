'use client';

import { useState } from 'react';
import {
  criarCategoriaAdicional,
  atualizarCategoriaAdicional,
  alternarAtivoCategoriaAdicional,
  listarCategoriasAdicionais,
} from '@/lib/comanda/categoriasAdicionais';
import { TIPOS_PEDIDO, TIPO_LABEL } from '@/lib/comanda/constantes';

function alternarTipo(lista, tipo) {
  return lista.includes(tipo) ? lista.filter((t) => t !== tipo) : [...lista, tipo];
}

export default function PainelCategoriasAdicionais({ supabase, categorias, onMudou }) {
  const [emEdicaoId, setEmEdicaoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [emojiEdicao, setEmojiEdicao] = useState('');
  const [gratuitaTiposEdicao, setGratuitaTiposEdicao] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmoji, setNovoEmoji] = useState('');
  const [novaGratuitaTipos, setNovaGratuitaTipos] = useState([]);
  const [erro, setErro] = useState(null);

  async function recarregar() {
    onMudou(await listarCategoriasAdicionais(supabase));
  }

  async function adicionar(e) {
    e.preventDefault();
    if (!novoNome) return;

    try {
      await criarCategoriaAdicional(supabase, { nome: novoNome, emoji: novoEmoji, gratuitaTipos: novaGratuitaTipos });
      setNovoNome('');
      setNovoEmoji('');
      setNovaGratuitaTipos([]);
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
    setGratuitaTiposEdicao(categoria.gratuita_tipos ?? []);
  }

  async function salvarEdicao(id) {
    try {
      await atualizarCategoriaAdicional(supabase, id, { nome: nomeEdicao, emoji: emojiEdicao, gratuitaTipos: gratuitaTiposEdicao });
      setEmEdicaoId(null);
      await recarregar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar.');
    }
  }

  async function toggleAtivo(categoria) {
    try {
      await alternarAtivoCategoriaAdicional(supabase, categoria.id, !categoria.ativo);
      await recarregar();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Categorias de adicionais</p>

      <div className="flex flex-wrap gap-2">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
              categoria.ativo ? 'border-gray-100 bg-[#F7F7F7]' : 'border-gray-200 bg-gray-100 opacity-60'
            }`}
          >
            {emEdicaoId === categoria.id ? (
              <>
                <input
                  value={emojiEdicao}
                  onChange={(e) => setEmojiEdicao(e.target.value)}
                  className="w-10 px-1 py-1 rounded-lg border border-gray-200 text-center"
                />
                <input
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                  className="w-28 px-2 py-1 rounded-lg border border-gray-200"
                />
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 whitespace-nowrap">
                  <span>Grátis em:</span>
                  {TIPOS_PEDIDO.map((tipoPedido) => (
                    <label key={tipoPedido} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={gratuitaTiposEdicao.includes(tipoPedido)}
                        onChange={() => setGratuitaTiposEdicao((atual) => alternarTipo(atual, tipoPedido))}
                      />
                      {TIPO_LABEL[tipoPedido]}
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => salvarEdicao(categoria.id)} className="font-black uppercase text-sv-blue">
                  Salvar
                </button>
              </>
            ) : (
              <>
                <span>{categoria.emoji || '🏷️'}</span>
                <span className="font-bold text-sv-dark">{categoria.nome}</span>
                {(categoria.gratuita_tipos ?? []).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider">
                    Grátis: {categoria.gratuita_tipos.map((t) => TIPO_LABEL[t] ?? t).join(', ')}
                  </span>
                )}
                <button type="button" onClick={() => iniciarEdicao(categoria)} className="font-black uppercase text-sv-blue">
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleAtivo(categoria)}
                  className={`font-black uppercase ${categoria.ativo ? 'text-gray-400' : 'text-green-600'}`}
                >
                  {categoria.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={adicionar} className="flex items-center gap-2">
        <input
          value={novoEmoji}
          onChange={(e) => setNovoEmoji(e.target.value)}
          placeholder="🍞"
          className="w-12 px-2 py-2 rounded-lg border border-gray-200 text-center text-sm"
        />
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Ex: Pães"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
        />
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 whitespace-nowrap flex-shrink-0">
          <span>Grátis em:</span>
          {TIPOS_PEDIDO.map((tipoPedido) => (
            <label key={tipoPedido} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={novaGratuitaTipos.includes(tipoPedido)}
                onChange={() => setNovaGratuitaTipos((atual) => alternarTipo(atual, tipoPedido))}
              />
              {TIPO_LABEL[tipoPedido]}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="bg-sv-dark text-white text-[10px] font-black uppercase px-3 py-2 rounded-lg flex-shrink-0"
        >
          + Add
        </button>
      </form>

      {erro && <p className="text-sv-red text-[11px] font-bold">{erro}</p>}
    </div>
  );
}
