// Acesso a dados dos cupons de desconto.
// Recebe sempre uma instância do client Supabase (criarClienteBrowser()).

export async function listarTodosCupons(supabase) {
  const { data, error } = await supabase
    .from('cupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Busca só pra conferência visual antes de enviar o pedido — quem decide
// se o cupom vale de verdade é o criar_pedido, no servidor.
export async function buscarCupomPorCodigo(supabase, codigo) {
  const { data, error } = await supabase
    .from('cupons')
    .select('*')
    .ilike('codigo', codigo)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function criarCupom(supabase, dados) {
  const { error } = await supabase.from('cupons').insert({
    codigo: dados.codigo.trim().toUpperCase(),
    descricao: dados.descricao || null,
    tipo_desconto: dados.tipoDesconto,
    valor: dados.valor,
    valor_minimo_pedido: dados.valorMinimoPedido || 0,
    valido_de: dados.validoDe || null,
    valido_ate: dados.validoAte || null,
    limite_uso: dados.limiteUso || null,
    ativo: dados.ativo ?? true,
  });

  if (error) throw error;
}

export async function atualizarCupom(supabase, id, dados) {
  const { error } = await supabase
    .from('cupons')
    .update({
      codigo: dados.codigo.trim().toUpperCase(),
      descricao: dados.descricao || null,
      tipo_desconto: dados.tipoDesconto,
      valor: dados.valor,
      valor_minimo_pedido: dados.valorMinimoPedido || 0,
      valido_de: dados.validoDe || null,
      valido_ate: dados.validoAte || null,
      limite_uso: dados.limiteUso || null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoCupom(supabase, id, ativo) {
  const { error } = await supabase.from('cupons').update({ ativo }).eq('id', id);
  if (error) throw error;
}
