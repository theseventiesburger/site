'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatarBRL } from '@/lib/comanda/formato';

function descreverDesconto(cupom) {
  return cupom.tipo_desconto === 'percentual' ? `${cupom.valor}% OFF` : `${formatarBRL(cupom.valor)} OFF`;
}

function descreverRegras(cupom) {
  const regras = [];
  if (Number(cupom.valor_minimo_pedido) > 0) regras.push(`pedido mínimo de ${formatarBRL(cupom.valor_minimo_pedido)}`);
  if (cupom.valido_ate) {
    const [ano, mes, dia] = cupom.valido_ate.split('-');
    regras.push(`válido até ${dia}/${mes}/${ano}`);
  }
  return regras.join(' · ');
}

function CupomCard({ cupom }) {
  const [copiado, setCopiado] = useState(false);

  function copiarCodigo() {
    navigator.clipboard.writeText(cupom.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
      <div className="relative w-full h-32 bg-sv-dark flex items-center justify-center overflow-hidden">
        <span className="text-3xl font-black text-white uppercase tracking-tighter">{descreverDesconto(cupom)}</span>
      </div>

      <div className="relative flex items-center px-5">
        <div className="absolute -left-3 w-6 h-6 bg-[#F7F7F7] rounded-full border border-gray-100" />
        <div className="flex-1 border-t-2 border-dashed border-gray-200 my-0" />
        <div className="absolute -right-3 w-6 h-6 bg-[#F7F7F7] rounded-full border border-gray-100" />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p className="text-gray-500 text-sm font-medium leading-relaxed flex-grow">
          {cupom.descricao || 'Use o código na hora de fazer seu pedido.'}
        </p>
        {descreverRegras(cupom) && (
          <p className="text-gray-400 text-[11px] font-bold mt-2">{descreverRegras(cupom)}</p>
        )}

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

export default function CuponsPublico({ cupons }) {
  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

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

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter">
            Ofertas
          </h2>
          <p className="text-gray-400 text-sm font-medium mt-1">
            {cupons.length} {cupons.length === 1 ? 'cupom disponível' : 'cupons disponíveis'}
          </p>
        </div>

        {cupons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {cupons.map((cupom) => (
              <CupomCard key={cupom.id} cupom={cupom} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center mb-20">
            <span className="text-5xl mb-4">😕</span>
            <h3 className="text-2xl font-black text-sv-dark uppercase tracking-tight">Nenhum cupom no momento</h3>
            <p className="text-gray-400 text-sm mt-2">Volte em breve para novas promoções.</p>
          </div>
        )}
      </div>

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
