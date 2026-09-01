// Acesso a dados dos adicionais (por produto). Recebe sempre uma instância
// do client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

export async function listarAdicionaisDoProduto(supabase, produtoId) {
  const { data, error } = await supabase
    .from('adicionais')
    .select('*')
    .eq('produto_id', produtoId)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarAdicionaisAtivosPorProdutos(supabase, produtoIds) {
  if (!produtoIds || produtoIds.length === 0) return [];

  const { data, error } = await supabase
    .from('adicionais')
    .select('*')
    .in('produto_id', produtoIds)
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarAdicional(supabase, produtoId, dados) {
  const { error } = await supabase.from('adicionais').insert({
    produto_id: produtoId,
    nome: dados.nome,
    preco: dados.preco,
    ativo: dados.ativo ?? true,
  });

  if (error) throw error;
}

export async function atualizarAdicional(supabase, id, dados) {
  const { error } = await supabase
    .from('adicionais')
    .update({ nome: dados.nome, preco: dados.preco })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoAdicional(supabase, id, ativo) {
  const { error } = await supabase.from('adicionais').update({ ativo }).eq('id', id);
  if (error) throw error;
}
