// Acesso a dados do cadastro de clientes. Recebe sempre uma instância do
// client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

// Vírgula e parênteses quebram a sintaxe do filtro .or() do PostgREST —
// tira do termo de busca pra não estourar a query com um nome digitado
// com pontuação.
function termoDeBusca(termo) {
  return termo.trim().replace(/[,()]/g, '');
}

export async function buscarClientes(supabase, termo) {
  const termoLimpo = termoDeBusca(termo);
  if (termoLimpo.length < 2) return [];

  const { data, error } = await supabase
    .from('clientes')
    .select('*, bairros(id, nome, valor_entrega)')
    .or(`nome.ilike.%${termoLimpo}%,telefone.ilike.%${termoLimpo}%`)
    .order('nome', { ascending: true })
    .limit(8);

  if (error) throw error;
  return data;
}

export async function listarClientes(supabase, termo = '') {
  let query = supabase
    .from('clientes')
    .select('*, bairros(id, nome, valor_entrega), pedidos(count)')
    .order('nome', { ascending: true });

  const termoLimpo = termoDeBusca(termo);
  if (termoLimpo) query = query.or(`nome.ilike.%${termoLimpo}%,telefone.ilike.%${termoLimpo}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarCliente(supabase, dados) {
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nome: dados.nome,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      bairro_id: dados.bairroId || null,
      cidade: dados.cidade || null,
      estado: dados.estado || null,
      data_nascimento: dados.dataNascimento || null,
    })
    .select('*, bairros(id, nome, valor_entrega)')
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarCliente(supabase, id, dados) {
  const { error } = await supabase
    .from('clientes')
    .update({
      nome: dados.nome,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      bairro_id: dados.bairroId || null,
      cidade: dados.cidade || null,
      estado: dados.estado || null,
      data_nascimento: dados.dataNascimento || null,
    })
    .eq('id', id);

  if (error) throw error;
}
