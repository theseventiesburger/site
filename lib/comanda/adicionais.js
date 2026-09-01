// Acesso a dados dos adicionais — catálogo global, vinculado a produtos por
// uma tabela de junção (produto_adicionais). Recebe sempre uma instância do
// client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

export async function listarTodosAdicionais(supabase) {
  const { data, error } = await supabase
    .from('adicionais')
    .select('*')
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarAdicionaisDoProduto(supabase, produtoId) {
  const { data, error } = await supabase
    .from('produto_adicionais')
    .select('adicional_id')
    .eq('produto_id', produtoId);

  if (error) throw error;
  return new Set((data ?? []).map((v) => v.adicional_id));
}

// Adicionais ativos vinculados a qualquer um dos produtos informados —
// devolve já achatado como {..adicional, produto_id}, pra filtrar por
// produto no carrinho igual antes.
export async function listarAdicionaisAtivosPorProdutos(supabase, produtoIds) {
  if (!produtoIds || produtoIds.length === 0) return [];

  const { data, error } = await supabase
    .from('produto_adicionais')
    .select('produto_id, adicionais(*)')
    .in('produto_id', produtoIds);

  if (error) throw error;

  return (data ?? [])
    .filter((v) => v.adicionais?.ativo)
    .map((v) => ({ ...v.adicionais, produto_id: v.produto_id }));
}

export async function criarAdicional(supabase, dados) {
  const { error } = await supabase.from('adicionais').insert({
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

export async function vincularAdicionalProduto(supabase, produtoId, adicionalId) {
  const { error } = await supabase
    .from('produto_adicionais')
    .insert({ produto_id: produtoId, adicional_id: adicionalId });

  if (error) throw error;
}

export async function desvincularAdicionalProduto(supabase, produtoId, adicionalId) {
  const { error } = await supabase
    .from('produto_adicionais')
    .delete()
    .eq('produto_id', produtoId)
    .eq('adicional_id', adicionalId);

  if (error) throw error;
}
