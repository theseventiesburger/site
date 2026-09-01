'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sair } from '@/app/comanda/actions';
import NotificacoesPush from '@/components/comanda/NotificacoesPush';

const links = [
  { href: '/comanda', label: 'Comanda' },
  { href: '/comanda/novo/mesa', label: 'Nova Mesa' },
  { href: '/comanda/novo/delivery', label: 'Novo Delivery' },
  { href: '/comanda/novo/pdv', label: 'Novo PDV' },
  { href: '/comanda/cozinha', label: 'Cozinha' },
  { href: '/comanda/produtos', label: 'Produtos' },
  { href: '/comanda/adicionais', label: 'Adicionais' },
  { href: '/comanda/categorias', label: 'Categorias' },
];

export default function ComandaTopbar({ email, userId }) {
  const pathname = usePathname();

  return (
    <nav className="w-full h-16 bg-sv-dark border-b border-white/10 flex items-center px-4 md:px-6 sticky top-0 z-50">
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors duration-150 ${
                  ativo ? 'bg-sv-blue text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
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
