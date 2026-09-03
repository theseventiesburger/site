'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { entrarCliente } from '@/app/(site)/conta/actions';

const estadoInicial = { erro: null };

export default function FormularioEntrar({ proximo }) {
  const [estado, formAction, pendente] = useActionState(entrarCliente, estadoInicial);

  return (
    <form action={formAction} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-5">
      <input type="hidden" name="proximo" value={proximo} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-widest">E-mail</label>
        <input
          id="email" name="email" type="email" required autoComplete="username"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
          placeholder="voce@email.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="senha" className="text-xs font-black text-gray-400 uppercase tracking-widest">Senha</label>
          <Link href="/conta/recuperar-senha" className="text-[11px] font-bold text-sv-blue hover:text-sv-red">
            Esqueci a senha
          </Link>
        </div>
        <input
          id="senha" name="senha" type="password" required autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
          placeholder="••••••••"
        />
      </div>

      {estado?.erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">{estado.erro}</p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="mt-2 bg-sv-blue text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:bg-sv-red disabled:opacity-60"
      >
        {pendente ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-gray-400 text-xs font-medium">
        Ainda não tem conta?{' '}
        <Link href={`/conta/cadastro?proximo=${encodeURIComponent(proximo)}`} className="text-sv-blue font-black hover:text-sv-red">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
