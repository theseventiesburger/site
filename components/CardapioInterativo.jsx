'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatarBRL } from '@/lib/comanda/formato';
import GoogleRatingBadge from '@/components/GoogleRatingBadge';

export default function CardapioInterativo({ produtos, categorias = [] }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [produtoEmDestaque, setProdutoEmDestaque] = useState(null);

  const categoriasComTodos = useMemo(
    () => [{ id: 'todos', nome: 'Todos', emoji: '🍔' }, ...categorias],
    [categorias]
  );

  const produtosFiltrados =
    categoriaAtiva === 'todos'
      ? produtos
      : produtos.filter((p) => p.categoria_id === categoriaAtiva);

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter">
              {categoriasComTodos.find((c) => c.id === categoriaAtiva)?.nome ?? 'Todos'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'item' : 'itens'} encontrados
            </p>
          </div>
          <div className="w-16 h-1.5 bg-sv-red rounded-full hidden md:block" />
        </div>

        {/* ── Grid de Produtos ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
            >
              <div
                className="relative w-full h-52 bg-[#F7F7F7] overflow-hidden cursor-pointer"
                onClick={() => setProdutoEmDestaque(produto)}
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
                    {produto.preco_promocional ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">{formatarBRL(produto.preco)}</span>
                        <span className="text-2xl font-black text-sv-red">{formatarBRL(produto.preco_promocional)}</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-black text-sv-dark">{formatarBRL(produto.preco)}</span>
                    )}
                  </div>

                  <Link
                    href={`/pedido/${produto.slug}`}
                    className="bg-sv-blue text-white font-black px-6 py-3 rounded-xl shadow-md transition-all duration-200 hover:bg-sv-red hover:scale-105 tracking-wide uppercase text-xs"
                  >
                    Eu quero
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {produtosFiltrados.length === 0 && (
            <p className="col-span-full text-center text-gray-400 text-sm font-medium py-12">
              Nenhum produto nessa categoria no momento.
            </p>
          )}
        </div>
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
