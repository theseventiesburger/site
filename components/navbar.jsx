'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Menu() {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white border-b-4 border-[#E51212] shadow-md z-50 flex items-center font-sans">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">

        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="The Seventies Artesanal Burger"
              width={90}
              height={90}
              priority
              className="object-contain rounded-full border-4 border-white shadow-lg transform transition-transform duration-300 translate-y-4 hover:scale-105"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#1A1A1A] font-extrabold text-xl tracking-wide transition-all duration-200 hover:text-[#0026E6]">
            Início
          </Link>
          <Link href="/cupons" className="text-[#1A1A1A] font-extrabold text-xl tracking-wide transition-all duration-200 hover:text-[#0026E6]">
            Cupons
          </Link>
          <Link href="/cardapio" className="text-[#1A1A1A] font-extrabold text-xl tracking-wide transition-all duration-200 hover:text-[#0026E6]">
            Cardápio
          </Link>
          <Link href="/appseventies" className="text-[#1A1A1A] font-extrabold text-xl tracking-wide transition-all duration-200 hover:text-[#0026E6]">
            App
          </Link>
          <Link href="/clube" className="text-[#1A1A1A] font-extrabold text-xl tracking-wide transition-all duration-200 hover:text-[#0026E6]">
            Clube
          </Link>

          {/* Dropdown Delivery */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownAberto(!dropdownAberto)}
              className="flex items-center gap-2 bg-[#0026E6] text-white font-black text-lg px-6 py-2 rounded-full tracking-wider shadow-md transition-all duration-200 hover:bg-[#E51212] hover:scale-105"
            >
              Delivery
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownAberto && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

                {/* Seta decorativa */}
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                <a
                  href="https://wa.me/5535992776777"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDropdownAberto(false)}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-[#F7F7F7] transition-colors duration-150 group border-b border-gray-100"
                >
                  {/* Ícone WhatsApp */}
                  <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.054 23.446a.75.75 0 0 0 .925.926l5.633-1.485A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.953-1.355l-.355-.211-3.683.970.988-3.607-.232-.371A9.696 9.696 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-black text-[#1A1A1A] text-sm uppercase tracking-wide group-hover:text-[#0026E6] transition-colors duration-150">
                      WhatsApp
                    </span>
                    <span className="block text-[11px] text-gray-400 font-medium">Peça direto conosco</span>
                  </div>
                </a>

                <a
                  href="https://www.uairango.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDropdownAberto(false)}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-[#F7F7F7] transition-colors duration-150 group"
                >
                  {/* Ícone UaiRango */}
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-sm relative">
                    <Image src="/uairango.png" alt="UaiRango" fill className="object-contain" />
                  </div>
                  <div>
                    <span className="block font-black text-[#1A1A1A] text-sm uppercase tracking-wide group-hover:text-[#0026E6] transition-colors duration-150">
                      UaiRango
                    </span>
                    <span className="block text-[11px] text-gray-400 font-medium">Delivery por plataforma</span>
                  </div>
                </a>

              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
