import { criarClienteServidor } from '@/lib/supabase/server';

// Confere se quem está chamando uma API route (não uma página — essas já
// são cobertas pelo proxy.js) é da equipe. Mesmo critério de eh_staff():
// existe linha em `perfis` pro usuário logado.
export async function exigirStaff() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase.from('perfis').select('user_id').eq('user_id', user.id).maybeSingle();
  return perfil ? user : null;
}
