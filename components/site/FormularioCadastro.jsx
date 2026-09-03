'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { cadastrarCliente } from '@/app/(site)/conta/actions';
import { formatarTelefone } from '@/lib/comanda/formato';

const estadoInicial = { erro: null, sucesso: null };

export default function FormularioCadastro({ proximo }) {
  const [estado, formAction, pendente] = useActionState(cadastrarCliente, estadoInicial);
  const [telefone, setTelefone] = useState('');

  if (estado?.sucesso) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col gap-3">
        <span className="text-4xl">📬</span>
        <p className="text-sv-dark font-bold text-sm">{estado.sucesso}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <input type="hidden" name="proximo" value={proximo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-xs font-black text-gray-400 uppercase tracking-widest">Nome completo</label>
        <input
          id="nome" name="nome" type="text" required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="telefone" className="text-xs font-black text-gray-400 uppercase tracking-widest">Telefone</label>
        <input
          id="telefone" name="telefone" type="tel" required
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          placeholder="(35) 99277-6777"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-widest">E-mail</label>
        <input
          id="email" name="email" type="email" required autoComplete="username"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-xs font-black text-gray-400 uppercase tracking-widest">Senha</label>
        <input
          id="senha" name="senha" type="password" required minLength={6} autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
          placeholder="Mínimo 6 caracteres"
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
        {pendente ? 'Criando conta...' : 'Criar conta'}
      </button>

      <p className="text-center text-gray-400 text-xs font-medium">
        Já tem conta?{' '}
        <Link href={`/conta/entrar?proximo=${encodeURIComponent(proximo)}`} className="text-sv-blue font-black hover:text-sv-red">
          Entrar
        </Link>
      </p>
    </form>
  );
}
