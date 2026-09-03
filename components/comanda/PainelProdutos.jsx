'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarTodosProdutos, alternarAtivoProduto } from '@/lib/comanda/produtos';
import { formatarBRL } from '@/lib/comanda/formato';
import FormularioProduto from '@/components/comanda/FormularioProduto';
import FormularioReceita from '@/components/comanda/FormularioReceita';

export default function PainelProdutos({ produtosIniciais, categorias, insumos = [] }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(undefined); // undefined = fechado, null = criar, objeto = editar
  const [produtoComReceita, setProdutoComReceita] = useState(null);

  async function recarregar() {
    const dados = await listarTodosProdutos(supabase);
    setProdutos(dados);
    setProdutoEmEdicao(undefined);
  }

  async function toggleAtivo(produto) {
    setProdutos((atual) =>
      atual.map((p) => (p.id === produto.id ? { ...p, ativo: !p.ativo } : p))
    );
    try {
      await alternarAtivoProduto(supabase, produto.id, !produto.ativo);
    } catch (err) {
      console.error(err);
      recarregar();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm font-medium">{produtos.length} produtos cadastrados</p>
        <div className="flex items-center gap-3">
          <Link
            href="/comanda/produtos/fichas"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-sv-dark border border-gray-200 font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-all duration-200 hover:border-sv-blue hover:text-sv-blue"
          >
            🖨️ Imprimir fichas
          </Link>
          <button
            type="button"
            onClick={() => setProdutoEmEdicao(null)}
            className="bg-sv-blue hover:bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
          >
            + Novo Produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className={`bg-white rounded-2xl shadow-md border p-4 flex gap-4 ${
              produto.ativo ? 'border-gray-100' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-[#F7F7F7] flex-shrink-0">
              <Image src={produto.imagem} alt={produto.nome} fill className="object-contain" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate">
                    {produto.nome}
                  </p>
                  {produto.preco_promocional && (
                    <span className="flex-shrink-0 bg-sv-red/10 text-sv-red text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Promo
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs font-bold">
                  {produto.categorias?.nome ?? 'Sem categoria'} ·{' '}
                  {produto.preco_promocional ? (
                    <>
                      <span className="line-through">{formatarBRL(produto.preco)}</span>{' '}
                      <span className="text-sv-red">{formatarBRL(produto.preco_promocional)}</span>
                    </>
                  ) : (
                    formatarBRL(produto.preco)
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                <button
                  type="button"
                  onClick={() => setProdutoEmEdicao(produto)}
                  className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red"
                >
                  Editar
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={() => toggleAtivo(produto)}
                  className={`whitespace-nowrap text-[10px] font-black uppercase tracking-wider ${
                    produto.ativo ? 'text-gray-400 hover:text-sv-red' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {produto.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={() => setProdutoComReceita(produto)}
                  className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red"
                >
                  Ficha técnica
                </button>
                <span className="text-gray-300">·</span>
                <Link
                  href={`/comanda/produtos/${produto.id}/ficha`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red"
                >
                  Imprimir
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {produtoEmEdicao !== undefined && (
        <FormularioProduto
          supabase={supabase}
          produto={produtoEmEdicao}
          categorias={categorias}
          onFechar={() => setProdutoEmEdicao(undefined)}
          onSalvo={recarregar}
        />
      )}

      {produtoComReceita && (
        <FormularioReceita
          supabase={supabase}
          tipo="produto"
          itemId={produtoComReceita.id}
          itemNome={produtoComReceita.nome}
          insumos={insumos}
          onFechar={() => setProdutoComReceita(null)}
        />
      )}
    </div>
  );
}
