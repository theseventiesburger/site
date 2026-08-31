'use client';

import { useState } from 'react';
import Image from 'next/image';

// ─── Dados ────────────────────────────────────────────────────────────────────
const categoriasFiltro = [
  { id: 'todos',     label: 'Todos'       },
  { id: 'combos',   label: 'Combos'      },
  { id: 'burgers',  label: 'Hambúrgueres'},
  { id: 'bebidas',  label: 'Bebidas'     },
  { id: 'sobremesa',label: 'Sobremesas'  },
];

const cupons = [
  {
    id: 1,
    titulo: 'Combo New Castle',
    descricao: 'New Castle + Batata Rústica P + Refri 400ml',
    preco: 'R$ 49,90',
    precoOriginal: 'R$ 61,70',
    imagem: '/hb2.png',
    categoria: 'combos',
    codigo: 'CASTLE49',
    destaque: true,
  },
  {
    id: 2,
    titulo: 'Combo Metro Black',
    descricao: 'Metro Black + Batata Frita P + Refri 400ml',
    preco: 'R$ 44,90',
    precoOriginal: 'R$ 55,80',
    imagem: '/hb2.png',
    categoria: 'combos',
    codigo: 'METRO44',
    destaque: false,
  },
  {
    id: 3,
    titulo: 'Combo Gorgon',
    descricao: 'Gorgon + Batata Temperada P + Refri 400ml',
    preco: 'R$ 52,90',
    precoOriginal: 'R$ 66,80',
    imagem: '/hb2.png',
    categoria: 'combos',
    codigo: 'GORGON52',
    destaque: false,
  },
  {
    id: 4,
    titulo: 'New Castle Dobrado',
    descricao: 'Leve 2 New Castle pelo preço de 1 e meio',
    preco: 'R$ 54,90',
    precoOriginal: 'R$ 69,80',
    imagem: '/hb2.png',
    categoria: 'burgers',
    codigo: 'DOUBLE54',
    destaque: true,
  },
  {
    id: 5,
    titulo: 'Milk Shake Duplo',
    descricao: '2 Milk Shakes 400ml — sabores à escolha',
    preco: 'R$ 29,90',
    precoOriginal: 'R$ 39,80',
    imagem: '/hb2.png',
    categoria: 'bebidas',
    codigo: 'SHAKE29',
    destaque: false,
  },
  {
    id: 6,
    titulo: 'Brownie + Sorvete',
    descricao: 'Brownie quentinho com bola de sorvete e calda',
    preco: 'R$ 12,90',
    precoOriginal: 'R$ 16,90',
    imagem: '/hb2.png',
    categoria: 'sobremesa',
    codigo: 'SWEET12',
    destaque: false,
  },
  {
    id: 7,
    titulo: 'Batata Rústica Grátis',
    descricao: 'Ganhe uma Batata Rústica P na compra de qualquer burger',
    preco: 'GRÁTIS',
    precoOriginal: 'R$ 12,90',
    imagem: '/hb2.png',
    categoria: 'combos',
    codigo: 'BATATA0',
    destaque: true,
  },
  {
    id: 8,
    titulo: 'Gorgon Individual',
    descricao: 'Gorgon com desconto especial de terça a quinta',
    preco: 'R$ 32,90',
    precoOriginal: 'R$ 38,90',
    imagem: '/hb2.png',
    categoria: 'burgers',
    codigo: 'GORG32',
    destaque: false,
  },
];

// ─── Card de Cupom ─────────────────────────────────────────────────────────────
function CupomCard({ cupom }) {
  const [copiado, setCopiado] = useState(false);

  function copiarCodigo() {
    navigator.clipboard.writeText(cupom.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group relative">

      {/* Badge destaque */}
      {cupom.destaque && (
        <span className="absolute top-3 left-3 z-10 bg-sv-red text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
          🔥 Destaque
        </span>
      )}

      {/* Imagem */}
      <div className="relative w-full h-48 bg-[#F7F7F7] flex items-center justify-center overflow-hidden">
        <div className="w-40 h-40 relative transform transition-transform duration-500 group-hover:scale-110">
          <Image
            src={cupom.imagem}
            alt={cupom.titulo}
            fill
            sizes="160px"
            className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.12)]"
          />
        </div>
      </div>

      {/* Linha tracejada separadora — estilo cupom */}
      <div className="relative flex items-center px-5">
        <div className="absolute -left-3 w-6 h-6 bg-[#F7F7F7] rounded-full border border-gray-100" />
        <div className="flex-1 border-t-2 border-dashed border-gray-200 my-0" />
        <div className="absolute -right-3 w-6 h-6 bg-[#F7F7F7] rounded-full border border-gray-100" />
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-black text-sv-dark uppercase tracking-tight group-hover:text-sv-blue transition-colors duration-200">
          {cupom.titulo}
        </h3>
        <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed flex-grow">
          {cupom.descricao}
        </p>

        {/* Preços */}
        <div className="flex items-end gap-2 mt-4">
          <span className="text-2xl font-black text-sv-dark">{cupom.preco}</span>
          <span className="text-sm font-bold text-gray-400 line-through mb-0.5">{cupom.precoOriginal}</span>
        </div>

        {/* Código do cupom */}
        <button
          onClick={copiarCodigo}
          className={`mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-200 font-black text-sm uppercase tracking-widest
            ${copiado
              ? 'border-green-400 bg-green-50 text-green-600'
              : 'border-sv-blue text-sv-blue hover:bg-sv-blue hover:text-white hover:border-sv-blue'
            }
          `}
        >
          <span>{copiado ? '✓ Copiado!' : cupom.codigo}</span>
          <span className="text-[10px] font-bold tracking-wider opacity-70">
            {copiado ? '' : 'Copiar'}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function CuponsPage() {
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [filtroAberto, setFiltroAberto] = useState(false);

  const cuponsFiltrados =
    filtroAtivo === 'todos'
      ? cupons
      : cupons.filter((c) => c.categoria === filtroAtivo);

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

      {/* ── Hero Banner ───────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[280px] md:h-[360px] bg-sv-dark overflow-hidden">
        <Image
          src="/hb2.png"
          alt="Cupons The 70s"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sv-dark via-sv-dark/80 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-4">
            Economia garantida 🎫
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Cupons & <br />
            <span className="text-sv-red">Ofertas</span>
          </h1>
          <p className="text-gray-400 font-medium mt-4 max-w-sm text-sm md:text-base">
            Copie o código e use na hora de finalizar seu pedido.
          </p>
        </div>

        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">

        {/* Cabeçalho + Filtro */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter">
              Ofertas
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {cuponsFiltrados.length} {cuponsFiltrados.length === 1 ? 'cupom disponível' : 'cupons disponíveis'}
            </p>
          </div>

          {/* Botão filtrar */}
          <div className="relative">
            <button
              onClick={() => setFiltroAberto(!filtroAberto)}
              className="flex items-center gap-3 bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-md"
            >
              {/* Ícone filtro */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filtrar
            </button>

            {/* Dropdown de filtro */}
            {filtroAberto && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                {categoriasFiltro.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setFiltroAtivo(cat.id); setFiltroAberto(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-black uppercase tracking-wider transition-colors duration-150
                      ${filtroAtivo === cat.id
                        ? 'bg-sv-dark text-white'
                        : 'text-sv-dark hover:bg-gray-50'
                      }
                    `}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pílulas de categoria (mobile-friendly) */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-8">
          {categoriasFiltro.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFiltroAtivo(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-200
                ${filtroAtivo === cat.id
                  ? 'bg-sv-dark text-white shadow-md scale-105'
                  : 'bg-white text-sv-dark border border-gray-200 hover:border-sv-red hover:text-sv-red'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de cupons */}
        {cuponsFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {cuponsFiltrados.map((cupom) => (
              <CupomCard key={cupom.id} cupom={cupom} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">😕</span>
            <h3 className="text-2xl font-black text-sv-dark uppercase tracking-tight">Nenhum cupom aqui</h3>
            <p className="text-gray-400 text-sm mt-2">Tente outra categoria ou volte em breve.</p>
            <button
              onClick={() => setFiltroAtivo('todos')}
              className="mt-6 bg-sv-red text-white font-black px-8 py-3 rounded-xl uppercase tracking-wider text-sm hover:scale-105 transition-all duration-200"
            >
              Ver todos
            </button>
          </div>
        )}
      </div>

      {/* ── Banner App ────────────────────────────────────────────────────────── */}
      <div className="w-full bg-sv-dark text-white py-16 px-6 text-center">
        <p className="text-sv-blue text-xs font-black uppercase tracking-widest mb-3">Quer mais descontos?</p>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2">
          Baixe nosso app e ganhe <br />
          <span className="text-sv-red">cupons exclusivos</span>
        </h3>
        <p className="text-gray-400 text-sm font-medium mt-3 mb-8">
          Acumule pontos, resgate prêmios e fique por dentro de todas as promoções.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://www.apple.com/br/app-store/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-sv-dark font-black px-8 py-3 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-lg"
          >
            App Store
          </a>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sv-red text-white font-black px-8 py-3 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Google Play
          </a>
        </div>
      </div>

    </section>
  );
}
