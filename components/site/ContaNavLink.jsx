'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';

export default function ContaNavLink() {
  const [supabase] = useState(() => criarClienteBrowser());
  const [logado, setLogado] = useState(null); // null = ainda não sabe

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogado(Boolean(data.user)));

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setLogado(Boolean(sessao?.user));
    });

    return () => assinatura.subscription.unsubscribe();
  }, [supabase]);

  return (
    <Link
      href={logado ? '/conta' : '/conta/entrar'}
      className="flex items-center text-[#1A1A1A] hover:text-[#0026E6] transition-colors duration-200"
      title={logado ? 'Minha conta' : 'Entrar'}
    >
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  );
}
