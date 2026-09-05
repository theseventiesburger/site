'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarTodosProdutos, alternarAtivoProduto } from '@/lib/comanda/produtos';
import { formatarBRL } from '@/lib/comanda/formato';
import FormularioProduto from '@/components/comanda/FormularioProduto';
import FormularioReceita from '@/components/comanda/FormularioReceita';
import ConfiguracaoCombo from '@/components/comanda/ConfiguracaoCombo';

function CardProduto({ produto, onEditar, onToggleAtivo, onReceita }) {
  return (
    <div
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
            {!produto.vai_para_cozinha && (
              <span className="flex-shrink-0 bg-sv-blue/10 text-sv-blue text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Direto pra mesa
              </span>
            )}
            {produto.pode_virar_combo && (
              <span className="flex-shrink-0 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Combo +{formatarBRL(produto.preco_combo)}
              </span>
            )}
            {produto.produto_tamanhos?.length > 0 && (
              <span className="flex-shrink-0 bg-sv-dark/10 text-sv-dark text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                {produto.produto_tamanhos.length} tamanhos
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs font-bold">
            {produto.categorias?.nome ?? 'Sem categoria'} ·{' '}
            {produto.produto_tamanhos?.length > 0 ? (
              `A partir de ${formatarBRL(Math.min(...produto.produto_tamanhos.map((t) => Number(t.preco))))}`
            ) : produto.preco_promocional ? (
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
            onClick={() => onEditar(produto)}
            className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red"
          >
            Editar
          </button>
          <span className="text-gray-300">·</span>
          <button
            type="button"
            onClick={() => onToggleAtivo(produto)}
            className={`whitespace-nowrap text-[10px] font-black uppercase tracking-wider ${
              produto.ativo ? 'text-gray-400 hover:text-sv-red' : 'text-green-600 hover:text-green-700'
            }`}
          >
            {produto.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <span className="text-gray-300">·</span>
          <button
            type="button"
            onClick={() => onReceita(produto)}
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
  );
}

export default function PainelProdutos({
  produtosIniciais,
  categorias,
  categoriasAdicionais = [],
  comboConfigInicial,
  insumos = [],
}) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(undefined); // undefined = fechado, null = criar, objeto = editar
  const [produtoComReceita, setProdutoComReceita] = useState(null);
  const [erro, setErro] = useState(null);

  // Agrupado por categoria (categoria e produto dentro dela em ordem
  // alfabética) — bem mais fácil de achar um produto do que na lista solta
  // por "ordem" do cardápio, que é pensada pra exibição pro cliente, não
  // pra busca no cadastro. "Sem categoria" sempre por último.
  const gruposPorCategoria = useMemo(() => {
    const grupos = new Map();
    for (const produto of produtos) {
      const nomeCategoria = produto.categorias?.nome ?? 'Sem categoria';
      if (!grupos.has(nomeCategoria)) grupos.set(nomeCategoria, []);
      grupos.get(nomeCategoria).push(produto);
    }

    return [...grupos.entries()]
      .sort(([a], [b]) => {
        if (a === 'Sem categoria') return 1;
        if (b === 'Sem categoria') return -1;
        return a.localeCompare(b, 'pt-BR');
      })
      .map(([nomeCategoria, itens]) => ({
        nomeCategoria,
        itens: [...itens].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
      }));
  }, [produtos]);

  async function recarregar() {
    const dados = await listarTodosProdutos(supabase);
    setProdutos(dados);
    setProdutoEmEdicao(undefined);
  }

  async function toggleAtivo(produto) {
    setProdutos((atual) =>
      atual.map((p) => (p.id === produto.id ? { ...p, ativo: !p.ativo } : p))
    );
    setErro(null);
    try {
      await alternarAtivoProduto(supabase, produto.id, !produto.ativo);
    } catch (err) {
      console.error(err);
      setProdutos((atual) =>
        atual.map((p) => (p.id === produto.id ? { ...p, ativo: produto.ativo } : p))
      );
      setErro(`Não foi possível ${produto.ativo ? 'desativar' : 'ativar'} "${produto.nome}". Tente de novo.`);
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

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}

      <ConfiguracaoCombo supabase={supabase} comboConfigInicial={comboConfigInicial} produtos={produtos} />

      <div className="flex flex-col gap-8">
        {gruposPorCategoria.map(({ nomeCategoria, itens }) => (
          <div key={nomeCategoria} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black text-sv-dark uppercase tracking-widest whitespace-nowrap">
                {nomeCategoria}
              </h3>
              <span className="text-gray-400 text-xs font-bold whitespace-nowrap">{itens.length}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {itens.map((produto) => (
                <CardProduto
                  key={produto.id}
                  produto={produto}
                  onEditar={setProdutoEmEdicao}
                  onToggleAtivo={toggleAtivo}
                  onReceita={setProdutoComReceita}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {produtoEmEdicao !== undefined && (
        <FormularioProduto
          supabase={supabase}
          produto={produtoEmEdicao}
          categorias={categorias}
          categoriasAdicionais={categoriasAdicionais}
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
