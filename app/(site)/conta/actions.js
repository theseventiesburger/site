'use server';

import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

export async function entrarCliente(_estadoAnterior, formData) {
  const email = formData.get('email');
  const senha = formData.get('senha');
  const proximo = formData.get('proximo') || '/conta';

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { erro: 'E-mail ou senha inválidos.' };
  }

  redirect(proximo);
}

export async function cadastrarCliente(_estadoAnterior, formData) {
  const nome = formData.get('nome');
  const email = formData.get('email');
  const senha = formData.get('senha');
  const telefone = formData.get('telefone');
  const proximo = formData.get('proximo') || '/conta';

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, telefone } },
  });

  if (error) {
    return {
      erro: error.message?.toLowerCase().includes('already registered')
        ? 'Esse e-mail já tem cadastro — entre com sua senha.'
        : 'Não foi possível criar sua conta. Tente novamente.',
    };
  }

  // Sem confirmação de e-mail configurada no projeto, signUp já retorna
  // sessão ativa. Se um dia isso mudar, cai aqui em vez de redirecionar.
  if (!data.session) {
    return { erro: null, sucesso: 'Conta criada! Confirme seu e-mail pra poder entrar.' };
  }

  redirect(proximo);
}

export async function sairCliente() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect('/');
}
