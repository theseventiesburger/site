'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { criarClienteBrowser } from '@/lib/supabase/client';

export default function FormularioRedefinirSenha() {
  const [supabase] = useState(() => criarClienteBrowser());
  const router = useRouter();

  const [prontoPraRedefinir, setProntoPraRedefinir] = useState(null); // null = verificando
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // O link do e-mail já loga a sessão de recuperação sozinho (o SDK lê o
    // token da URL) — só confere se realmente rolou antes de mostrar o form.
    supabase.auth.getSession().then(({ data }) => setProntoPraRedefinir(Boolean(data.session)));

    const { data: assinatura } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (evento === 'PASSWORD_RECOVERY' || sessao) setProntoPraRedefinir(true);
    });

    return () => assinatura.subscription.unsubscribe();
  }, [supabase]);

  async function salvar(e) {
    e.preventDefault();
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setSucesso(true);
      setTimeout(() => router.push('/conta'), 2000);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar a nova senha. Tente pedir o link de novo.');
    } finally {
      setSalvando(false);
    }
  }

  if (prontoPraRedefinir === null) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center text-gray-400 text-sm font-medium">
        Verificando link...
      </div>
    );
  }

  if (!prontoPraRedefinir) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sv-dark font-bold text-sm">Esse link é inválido ou já expirou.</p>
        <Link
          href="/conta/recuperar-senha"
          className="mt-2 bg-sv-blue text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-red transition-colors duration-150"
        >
          Pedir novo link
        </Link>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col gap-3">
        <span className="text-4xl">✅</span>
        <p className="text-sv-dark font-bold text-sm">Senha alterada! Te levando pra Minha Conta...</p>
      </div>
    );
  }

  return (
    <form onSubmit={salvar} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-xs font-black text-gray-400 uppercase tracking-widest">Nova senha</label>
        <input
          id="senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmarSenha" className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirmar senha</label>
        <input
          id="confirmarSenha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">{erro}</p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="mt-2 bg-sv-blue text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:bg-sv-red disabled:opacity-60"
      >
        {salvando ? 'Salvando...' : 'Salvar nova senha'}
      </button>
    </form>
  );
}
