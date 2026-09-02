// Acesso a dados das categorias de adicionais (ex: Pães, Proteínas, Queijos).
// Recebe sempre uma instância do client Supabase (criarClienteBrowser()).

import { gerarSlug } from '@/lib/comanda/slug';

export async function listarCategoriasAdicionais(supabase) {
  const { data, error } = await supabase
    .from('categorias_adicionais')
    .select('*')
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarCategoriasAdicionaisAtivas(supabase) {
  const { data, error } = await supabase
    .from('categorias_adicionais')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarCategoriaAdicional(supabase, dados) {
  const { error } = await supabase.from('categorias_adicionais').insert({
    slug: gerarSlug(dados.nome),
    nome: dados.nome,
    emoji: dados.emoji || null,
    ativo: dados.ativo ?? true,
    gratuita: dados.gratuita ?? false,
  });

  if (error) throw error;
}

export async function atualizarCategoriaAdicional(supabase, id, dados) {
  const { error } = await supabase
    .from('categorias_adicionais')
    .update({ nome: dados.nome, emoji: dados.emoji || null, gratuita: dados.gratuita ?? false })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoCategoriaAdicional(supabase, id, ativo) {
  const { error } = await supabase.from('categorias_adicionais').update({ ativo }).eq('id', id);
  if (error) throw error;
}
