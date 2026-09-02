// Acesso a dados dos adicionais — catálogo geral, disponível pra qualquer
// produto na hora de montar o pedido (não são vinculados a um produto
// específico no cadastro). Recebe sempre uma instância do client Supabase
// (criarClienteBrowser()) — mantém as queries fora da JSX.

export async function listarTodosAdicionais(supabase) {
  const { data, error } = await supabase
    .from('adicionais')
    .select('*, categorias_adicionais(id, nome, emoji, gratuita)')
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarAdicionaisAtivos(supabase) {
  const { data, error } = await supabase
    .from('adicionais')
    .select('*, categorias_adicionais(id, nome, emoji, gratuita)')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarAdicional(supabase, dados) {
  const { error } = await supabase.from('adicionais').insert({
    nome: dados.nome,
    preco: dados.preco,
    categoria_id: dados.categoriaId || null,
    ativo: dados.ativo ?? true,
  });

  if (error) throw error;
}

export async function atualizarAdicional(supabase, id, dados) {
  const { error } = await supabase
    .from('adicionais')
    .update({ nome: dados.nome, preco: dados.preco, categoria_id: dados.categoriaId || null })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoAdicional(supabase, id, ativo) {
  const { error } = await supabase.from('adicionais').update({ ativo }).eq('id', id);
  if (error) throw error;
}
