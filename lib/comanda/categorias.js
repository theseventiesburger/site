// Acesso a dados das categorias de produto. Recebe sempre uma instância do
// client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

import { gerarSlug } from '@/lib/comanda/slug';

export async function listarCategorias(supabase) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarCategoriasAtivas(supabase) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarCategoria(supabase, dados) {
  const { error } = await supabase.from('categorias').insert({
    slug: gerarSlug(dados.nome),
    nome: dados.nome,
    emoji: dados.emoji || null,
    ativo: dados.ativo ?? true,
  });

  if (error) throw error;
}

export async function atualizarCategoria(supabase, id, dados) {
  const { error } = await supabase
    .from('categorias')
    .update({ nome: dados.nome, emoji: dados.emoji || null })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoCategoria(supabase, id, ativo) {
  const { error } = await supabase.from('categorias').update({ ativo }).eq('id', id);
  if (error) throw error;
}
