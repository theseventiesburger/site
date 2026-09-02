'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sair } from '@/app/comanda/actions';
import NotificacoesPush from '@/components/comanda/NotificacoesPush';

const ITENS_MENU = [
  { tipo: 'link', href: '/comanda', label: 'Início' },
  {
    tipo: 'menu',
    label: 'Vendas',
    itens: [
      { href: '/comanda/vendas', label: 'Visão Geral' },
      { href: '/comanda/novo/mesa', label: 'Nova Mesa' },
      { href: '/comanda/novo/delivery', label: 'Novo Delivery' },
      { href: '/comanda/novo/pdv', label: 'Novo PDV' },
      { href: '/comanda/abertos', label: 'Pedidos Abertos' },
    ],
  },
  { tipo: 'link', href: '/comanda/cozinha', label: 'Cozinha' },
  { tipo: 'link', href: '/comanda/relatorio', label: 'Relatório' },
  { tipo: 'link', href: '/comanda/auditoria', label: 'Auditoria' },
  {
    tipo: 'menu',
    label: 'Cadastros',
    itens: [
      { href: '/comanda/produtos', label: 'Produtos' },
      { href: '/comanda/adicionais', label: 'Adicionais' },
      { href: '/comanda/categorias', label: 'Categorias' },
      { href: '/comanda/clientes', label: 'Clientes' },
      { href: '/comanda/bairros', label: 'Bairros' },
      { href: '/comanda/cupons', label: 'Cupons' },
    ],
  },
];

export default function ComandaTopbar({ email, userId }) {
  const pathname = usePathname();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const mobileRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) setMenuMobileAberto(false);
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <nav className="relative w-full h-16 bg-sv-dark border-b border-white/10 flex items-center px-4 md:px-6 sticky top-0 z-50">
      <div className="w-full flex items-center justify-between gap-4">
        <div className="hidden md:flex items-center gap-1">
          {ITENS_MENU.map((item) =>
            item.tipo === 'link' ? (
              <NavLink key={item.href} href={item.href} label={item.label} ativo={pathname === item.href} />
            ) : (
              <NavMenu key={item.label} label={item.label} itens={item.itens} pathname={pathname} />
            )
          )}
        </div>

        <div className="md:hidden flex items-center" ref={mobileRef}>
          <button
            type="button"
            onClick={() => setMenuMobileAberto((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-wider"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Menu
          </button>

          {menuMobileAberto && (
            <div className="absolute top-full left-0 right-0 bg-sv-dark border-b border-white/10 shadow-2xl flex flex-col p-3 gap-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {ITENS_MENU.map((item) =>
                item.tipo === 'link' ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuMobileAberto(false)}
                    className={`px-3.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                      pathname === item.href ? 'bg-sv-blue text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div key={item.label} className="flex flex-col gap-0.5 mt-1.5 first:mt-0">
                    <span className="px-3.5 py-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {item.label}
                    </span>
                    {item.itens.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMenuMobileAberto(false)}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                          pathname === sub.href ? 'bg-sv-blue text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <NotificacoesPush userId={userId} />
          <span className="hidden sm:block text-gray-400 text-xs font-medium truncate max-w-[160px]">
            {email}
          </span>
          <form action={sair}>
            <button
              type="submit"
              className="bg-white/10 hover:bg-sv-red text-white font-black px-4 py-2 rounded-lg uppercase tracking-wider text-[11px] transition-colors duration-150"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, ativo }) {
  return (
    <Link
      href={href}
      className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors duration-150 ${
        ativo ? 'bg-sv-blue text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );
}

function NavMenu({ label, itens, pathname }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  const ativo = itens.some((item) => pathname === item.href);

  useEffect(() => {
    function handleClickFora(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors duration-150 ${
          ativo ? 'bg-sv-blue text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${aberto ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAberto(false)}
              className={`block px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors duration-150 ${
                pathname === item.href ? 'bg-sv-blue/10 text-sv-blue' : 'text-sv-dark hover:bg-[#F7F7F7]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
