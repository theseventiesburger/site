'use client';

import { useState } from 'react';
import Image from 'next/image';
import { criarProduto, atualizarProduto, enviarImagemProduto } from '@/lib/comanda/produtos';
import { parsePrecoInput } from '@/lib/comanda/formato';

export default function FormularioProduto({ supabase, produto, categorias, onFechar, onSalvo }) {
  const modoEdicao = Boolean(produto);

  const [nome, setNome] = useState(produto?.nome ?? '');
  const [descricao, setDescricao] = useState(produto?.descricao ?? '');
  const [preco, setPreco] = useState(produto?.preco ?? '');
  const [precoPromocional, setPrecoPromocional] = useState(produto?.preco_promocional ?? '');
  const [categoriaId, setCategoriaId] = useState(produto?.categoria_id ?? categorias[0]?.id ?? '');
  const [tag, setTag] = useState(produto?.tag ?? '');
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [previaImagem, setPreviaImagem] = useState(produto?.imagem ?? '/hb2.png');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  function selecionarImagem(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setArquivoImagem(arquivo);
    setPreviaImagem(URL.createObjectURL(arquivo));
  }

  async function salvar(e) {
    e.preventDefault();
    if (!nome || !preco || !categoriaId) {
      setErro('Preencha nome, preço e categoria.');
      return;
    }

    const precoNumero = parsePrecoInput(preco);
    const precoPromocionalNumero = precoPromocional ? parsePrecoInput(precoPromocional) : null;

    if (precoPromocionalNumero !== null && precoPromocionalNumero >= precoNumero) {
      setErro('O preço promocional precisa ser menor que o preço normal.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      let imagem = produto?.imagem ?? null;
      if (arquivoImagem) {
        imagem = await enviarImagemProduto(supabase, arquivoImagem);
      }

      const dados = {
        nome,
        descricao,
        preco: precoNumero,
        precoPromocional: precoPromocionalNumero,
        categoriaId,
        tag,
        ativo,
        imagem,
      };

      if (modoEdicao) {
        await atualizarProduto(supabase, produto.id, dados);
      } else {
        await criarProduto(supabase, dados);
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-4 my-auto"
      >
        <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">
          {modoEdicao ? 'Editar produto' : 'Novo produto'}
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 relative rounded-2xl overflow-hidden bg-[#F7F7F7] border border-gray-200 flex-shrink-0">
            <Image src={previaImagem} alt="Prévia" fill className="object-contain" unoptimized />
          </div>
          <label className="flex-1 text-xs font-black text-gray-400 uppercase tracking-widest">
            Foto do produto
            <input
              type="file"
              accept="image/*"
              onChange={selecionarImagem}
              className="block mt-2 text-xs font-medium text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sv-dark file:text-white file:text-xs file:font-black file:uppercase"
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Preço (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="34,90"
              required
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ''}{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Preço promocional (opcional)</label>
          <input
            type="text"
            inputMode="decimal"
            value={precoPromocional}
            onChange={(e) => setPrecoPromocional(e.target.value)}
            placeholder="29,90"
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
          <p className="text-gray-400 text-[11px] font-medium">
            Preenchido, o produto entra em promoção: preço riscado no cardápio e destaque no slider da home.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tag (opcional)</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Ex: O Mais Pedido 🔥"
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-sv-dark">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo (visível no cardápio e na comanda)
        </label>

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
