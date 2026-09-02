// Acesso a dados dos bairros de entrega (cada um com seu valor de frete).
// Recebe sempre uma instância do client Supabase (criarClienteBrowser()).

export async function listarBairrosAtivos(supabase) {
  const { data, error } = await supabase
    .from('bairros')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarTodosBairros(supabase) {
  const { data, error } = await supabase
    .from('bairros')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarBairro(supabase, dados) {
  const { error } = await supabase.from('bairros').insert({
    nome: dados.nome,
    valor_entrega: dados.valorEntrega,
    ativo: dados.ativo ?? true,
  });

  if (error) throw error;
}

export async function atualizarBairro(supabase, id, dados) {
  const { error } = await supabase
    .from('bairros')
    .update({ nome: dados.nome, valor_entrega: dados.valorEntrega })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoBairro(supabase, id, ativo) {
  const { error } = await supabase.from('bairros').update({ ativo }).eq('id', id);
  if (error) throw error;
}
