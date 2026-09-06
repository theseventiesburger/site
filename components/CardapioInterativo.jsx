'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { formatarBRL } from '@/lib/comanda/formato';
import GoogleRatingBadge from '@/components/GoogleRatingBadge';
import { useCarrinho } from '@/components/site/CarrinhoContext';

function BotaoAdicionar({ produto, tamanho }) {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);

  function clicar() {
    adicionar(produto, tamanho);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={clicar}
      className={`font-black px-6 py-3 rounded-xl shadow-md transition-all duration-200 tracking-wide uppercase text-xs ${
        adicionado ? 'bg-green-500 text-white' : 'bg-sv-blue text-white hover:bg-sv-red hover:scale-105'
      }`}
    >
      {adicionado ? '✓ Adicionado' : 'Eu quero'}
    </button>
  );
}

function BotaoTamanho({ produto, tamanho }) {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);

  function clicar() {
    adicionar(produto, tamanho);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={clicar}
      className={`flex flex-col items-center px-4 py-2 rounded-xl border font-black transition-all duration-200 ${
        adicionado
          ? 'bg-green-500 border-green-500 text-white'
          : 'border-gray-200 text-sv-dark hover:border-sv-blue hover:scale-105'
      }`}
    >
      <span className="text-xs uppercase tracking-wider">{adicionado ? '✓' : tamanho.nome}</span>
      <span className="text-[10px] font-bold opacity-80">{formatarBRL(tamanho.preco)}</span>
    </button>
  );
}

function CardProduto({ produto, onDestacar }) {
  const tamanhos = [...(produto.produto_tamanhos ?? [])].sort((a, b) => a.ordem - b.ordem);
  const menorPreco = tamanhos.length > 0 ? Math.min(...tamanhos.map((t) => Number(t.preco))) : null;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
      <div
        className="relative w-full h-52 bg-[#F7F7F7] overflow-hidden cursor-pointer"
        onClick={() => onDestacar(produto)}
      >
        {produto.tag && (
          <span className="absolute top-3 left-3 bg-sv-dark text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10">
            {produto.tag}
          </span>
        )}
        {produto.preco_promocional && (
          <span className="absolute top-3 right-3 bg-sv-red text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10">
            Promoção
          </span>
        )}
        <Image
          src={produto.imagem}
          alt={produto.nome}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-black text-sv-dark uppercase tracking-tight group-hover:text-sv-blue transition-colors duration-200">
          {produto.nome}
        </h3>
        <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed flex-grow">
          {produto.descricao}
        </p>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Preço</span>
            {tamanhos.length > 0 ? (
              <span className="text-2xl font-black text-sv-dark">A partir de {formatarBRL(menorPreco)}</span>
            ) : produto.preco_promocional ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-gray-400 line-through">{formatarBRL(produto.preco)}</span>
                <span className="text-2xl font-black text-sv-red">{formatarBRL(produto.preco_promocional)}</span>
              </div>
            ) : (
              <span className="text-2xl font-black text-sv-dark">{formatarBRL(produto.preco)}</span>
            )}
          </div>

          {tamanhos.length === 0 && <BotaoAdicionar produto={produto} />}
        </div>

        {tamanhos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tamanhos.map((tamanho) => (
              <BotaoTamanho key={tamanho.id} produto={produto} tamanho={tamanho} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CardapioInterativo({ produtos, categorias = [] }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [produtoEmDestaque, setProdutoEmDestaque] = useState(null);

  const categoriasComTodos = useMemo(
    () => [{ id: 'todos', nome: 'Todos', emoji: '🍔' }, ...categorias],
    [categorias]
  );

  // Agrupa por categoria (na ordem cadastrada) em vez de jogar tudo numa
  // grade só — clicar numa categoria específica ainda filtra pra uma seção
  // só, mas "Todos" mostra cada categoria na sua própria seção, do jeito
  // que já funciona no cadastro (PainelProdutos.jsx).
  const secoes = useMemo(() => {
    const porCategoriaId = new Map();
    for (const produto of produtos) {
      const lista = porCategoriaId.get(produto.categoria_id) ?? [];
      lista.push(produto);
      porCategoriaId.set(produto.categoria_id, lista);
    }

    const categoriasParaExibir =
      categoriaAtiva === 'todos' ? categorias : categorias.filter((c) => c.id === categoriaAtiva);

    return categoriasParaExibir
      .map((categoria) => ({ categoria, itens: porCategoriaId.get(categoria.id) ?? [] }))
      .filter((secao) => secao.itens.length > 0);
  }, [produtos, categorias, categoriaAtiva]);

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen pt-20">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[320px] md:h-[420px] bg-sv-dark overflow-hidden">

        <Image
          src="/hb2.png"
          alt="Cardápio The 70s"
          fill
          className="object-cover opacity-30"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-sv-dark via-sv-dark/80 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-4">
            Descubra nossos sabores
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Nosso <br />
            <span className="text-sv-red">Cardápio</span>
          </h1>
          <p className="text-gray-400 font-medium mt-4 max-w-sm text-sm md:text-base">
            Ingredientes selecionados, receitas da casa e muito sabor em cada mordida.
          </p>

          <GoogleRatingBadge className="mt-5 self-start" />
        </div>

        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* ── Filtro de Categorias ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x">
          {categoriasComTodos.map((cat) => {
            const ativa = categoriaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`
                  snap-start flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-200
                  ${ativa
                    ? 'bg-sv-dark text-white shadow-lg scale-105'
                    : 'bg-white text-sv-dark border border-gray-200 hover:border-sv-red hover:text-sv-red'
                  }
                `}
              >
                <span>{cat.emoji}</span>
                {cat.nome}
              </button>
            );
          })}
        </div>

        <div className="w-full h-px bg-gray-200 mt-6 mb-10" />

        {categoriaAtiva === 'todos' && (
          <p className="text-gray-400 text-sm font-medium mb-10 -mt-4">
            {produtos.length} {produtos.length === 1 ? 'item' : 'itens'} no cardápio
          </p>
        )}

        {/* ── Seções por categoria ─────────────────────────────────────────── */}
        {secoes.map(({ categoria, itens }) => (
          <div key={categoria.id} className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl leading-none">{categoria.emoji}</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-sv-dark uppercase tracking-tighter">
                    {categoria.nome}
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                    {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
              <div className="w-16 h-1.5 bg-sv-red rounded-full hidden md:block" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itens.map((produto) => (
                <CardProduto key={produto.id} produto={produto} onDestacar={setProdutoEmDestaque} />
              ))}
            </div>
          </div>
        ))}

        {secoes.length === 0 && (
          <p className="text-center text-gray-400 text-sm font-medium py-12 mb-8">
            Nenhum produto nessa categoria no momento.
          </p>
        )}
      </div>

      {/* ── Banner CTA ───────────────────────────────────────────────────────── */}
      <div className="w-full bg-sv-dark text-white py-16 px-6 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Não encontrou o que queria?</p>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6">
          Fale com a gente <span className="text-sv-red">no WhatsApp</span>
        </h3>
        <a
          href="https://wa.me/5535992776777"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-sv-red text-white font-black px-10 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Chamar no WhatsApp
        </a>
      </div>

      {/* ── Foto em destaque ────────────────────────────────────────────────── */}
      {produtoEmDestaque && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center px-4 py-10"
          onClick={() => setProdutoEmDestaque(null)}
        >
          <button
            type="button"
            onClick={() => setProdutoEmDestaque(null)}
            aria-label="Fechar"
            className="absolute top-6 right-6 text-white text-3xl font-black hover:text-sv-red transition-colors duration-150"
          >
            ✕
          </button>

          <div className="relative w-full max-w-2xl h-[65vh]">
            <Image
              src={produtoEmDestaque.imagem}
              alt={produtoEmDestaque.nome}
              fill
              sizes="100vw"
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            />
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-center px-6">
            <p className="text-white font-black text-2xl md:text-3xl uppercase tracking-tight">
              {produtoEmDestaque.nome}
            </p>
            {produtoEmDestaque.preco_promocional ? (
              <p className="font-black text-lg mt-1">
                <span className="text-gray-400 line-through mr-2">{formatarBRL(produtoEmDestaque.preco)}</span>
                <span className="text-sv-red">{formatarBRL(produtoEmDestaque.preco_promocional)}</span>
              </p>
            ) : (
              <p className="text-sv-blue font-black text-lg mt-1">{formatarBRL(produtoEmDestaque.preco)}</p>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
