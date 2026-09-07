// Acesso a dados do relatório de vendas. Recebe sempre uma instância do
// client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

// `desde`/`ate` já vêm como timestamps prontos (ver limitesDiaComercial em
// lib/comanda/formato.js) — início inclusivo, fim exclusivo.
export async function listarPedidosPeriodo(supabase, { desde, ate }) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, itens_pedido(*, itens_pedido_adicionais(*))')
    .gte('created_at', desde)
    .lt('created_at', ate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
