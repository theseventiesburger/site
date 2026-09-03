// Acesso a dados do checkout público (site, sem login). Recebe sempre uma
// instância do client Supabase (criarClienteBrowser()).

export async function listarBairrosPublico(supabase) {
  const { data, error } = await supabase
    .from('bairros')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarPedidoSite(supabase, dados) {
  const { data, error } = await supabase.rpc('criar_pedido_site', {
    p_endereco: dados.endereco,
    p_bairro_id: dados.bairroId,
    p_ponto_referencia: dados.pontoReferencia || null,
    p_observacoes: dados.observacoes || null,
    p_cupom_codigo: dados.cupomCodigo || null,
    p_itens: dados.itens,
  });

  if (error) throw new Error(error.message);
  return data; // { id, numero, total, desconto, pago }
}
