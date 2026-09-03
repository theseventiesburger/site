// Cadastro do cliente logado no site. RLS já restringe a leitura/escrita à
// própria linha (user_id = auth.uid()), então nunca precisa filtrar por id
// manualmente aqui.

export async function obterMeuCadastro(supabase) {
  const { data, error } = await supabase.from('clientes').select('*, bairros(id, nome, valor_entrega)').maybeSingle();
  if (error) throw error;
  return data;
}

export async function atualizarMeuCadastro(supabase, clienteId, dados) {
  const { data, error } = await supabase
    .from('clientes')
    .update({
      nome: dados.nome,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      bairro_id: dados.bairroId || null,
      ponto_referencia: dados.pontoReferencia || null,
    })
    .eq('id', clienteId)
    .select();

  if (error) throw error;
  // .update() não dá erro sozinho quando o RLS barra a linha — sem
  // nenhuma linha retornada, nada foi salvo de verdade.
  if (!data || data.length === 0) {
    throw new Error('Não foi possível confirmar o salvamento. Tente entrar de novo.');
  }
}
