'use server';

import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

export async function entrar(_estadoAnterior, formData) {
  const email = formData.get('email');
  const senha = formData.get('senha');
  const proximo = formData.get('proximo') || '/comanda';

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { erro: 'E-mail ou senha inválidos.' };
  }

  redirect(proximo);
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect('/comanda/login');
}
