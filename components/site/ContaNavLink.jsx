'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { obterMeuCadastro } from '@/lib/site/clientes';

export default function ContaNavLink() {
  const [supabase] = useState(() => criarClienteBrowser());
  const [logado, setLogado] = useState(null); // null = ainda não sabe
  const [primeiroNome, setPrimeiroNome] = useState(null);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.auth.getUser();
      setLogado(Boolean(data.user));
      if (data.user) {
        try {
          const cliente = await obterMeuCadastro(supabase);
          setPrimeiroNome(cliente?.nome?.trim().split(' ')[0] ?? null);
        } catch {
          setPrimeiroNome(null);
        }
      } else {
        setPrimeiroNome(null);
      }
    }
    carregar();

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setLogado(Boolean(sessao?.user));
      if (!sessao?.user) setPrimeiroNome(null);
      else carregar();
    });

    return () => assinatura.subscription.unsubscribe();
  }, [supabase]);

  return (
    <Link
      href={logado ? '/conta' : '/conta/entrar'}
      className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#0026E6] transition-colors duration-200"
      title={logado ? 'Minha conta' : 'Entrar'}
    >
      <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {logado && primeiroNome && (
        <span className="hidden lg:block font-extrabold text-sm whitespace-nowrap">{primeiroNome}</span>
      )}
    </Link>
  );
}
