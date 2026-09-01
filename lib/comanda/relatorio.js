// Acesso a dados do relatório de vendas. Recebe sempre uma instância do
// client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

export async function listarPedidosPeriodo(supabase, { inicio, fim }) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, itens_pedido(*, itens_pedido_adicionais(*))')
    .gte('created_at', `${inicio}T00:00:00-03:00`)
    .lte('created_at', `${fim}T23:59:59.999-03:00`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
