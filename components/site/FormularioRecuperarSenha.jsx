'use client';

import { useState } from 'react';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';

export default function FormularioRecuperarSenha() {
  const [supabase] = useState(() => criarClienteBrowser());
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/conta/redefinir-senha`,
      });
      if (error) throw error;
      setEnviado(true);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível enviar o e-mail. Confira o endereço e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col gap-3">
        <span className="text-4xl">📬</span>
        <p className="text-sv-dark font-bold text-sm">
          Se esse e-mail tiver cadastro, um link pra redefinir a senha chega em instantes.
        </p>
        <p className="text-gray-400 text-xs font-medium">Confira também a caixa de spam.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-widest">E-mail</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
          placeholder="voce@email.com"
        />
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">{erro}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 bg-sv-blue text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:bg-sv-red disabled:opacity-60"
      >
        {enviando ? 'Enviando...' : 'Enviar link de recuperação'}
      </button>

      <p className="text-center text-gray-400 text-xs font-medium">
        <Link href="/conta/entrar" className="text-sv-blue font-black hover:text-sv-red">← Voltar pro login</Link>
      </p>
    </form>
  );
}
