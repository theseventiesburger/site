// Acesso a dados do lado do cliente para a Comanda Eletrônica.
// Recebe sempre uma instância do client Supabase (criarClienteBrowser()) —
// mantém as queries fora da JSX dos componentes.

export async function listarProdutos(supabase) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarMesas(supabase) {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('ativa', true)
    .order('numero', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarPedido(supabase, pedido) {
  const { data, error } = await supabase.rpc('criar_pedido', {
    p_tipo: pedido.tipo,
    p_mesa: pedido.mesa ?? null,
    p_comanda_id: pedido.comandaId ?? null,
    p_cliente_id: pedido.clienteId ?? null,
    p_cliente_nome: pedido.clienteNome ?? null,
    p_cliente_telefone: pedido.clienteTelefone ?? null,
    p_endereco: pedido.endereco ?? null,
    p_bairro_id: pedido.bairroId ?? null,
    p_cidade: pedido.cidade ?? null,
    p_estado: pedido.estado ?? null,
    p_ponto_referencia: pedido.pontoReferencia ?? null,
    p_taxa_entrega: pedido.taxaEntrega ?? 0,
    p_forma_pagamento: pedido.formaPagamento ?? null,
    p_observacoes: pedido.observacoes ?? null,
    p_cupom_codigo: pedido.cupomCodigo || null,
    p_itens: pedido.itens.map((item) => ({
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      observacao: item.observacao || null,
      ponto_carne: item.pontoCarne || null,
      adicionais: (item.adicionaisSelecionados ?? []).map((a) => ({ adicional_id: a.id })),
    })),
  });

  if (error) throw error;
  return data; // uuid do pedido criado
}

export async function buscarPedidoPorId(supabase, pedidoId) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, itens_pedido(*, itens_pedido_adicionais(*))')
    .eq('id', pedidoId)
    .single();

  if (error) throw error;
  return data;
}

export async function listarPedidosAbertos(supabase) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, itens_pedido(*, itens_pedido_adicionais(*))')
    .not('status', 'in', '(entregue,cancelado)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function atualizarStatusPedido(supabase, pedidoId, status) {
  const { error } = await supabase.from('pedidos').update({ status }).eq('id', pedidoId);
  if (error) throw error;
}

export async function atualizarPagamentoPedido(supabase, pedidoId, pago) {
  const { error } = await supabase.from('pedidos').update({ pago }).eq('id', pedidoId);
  if (error) throw error;
}

// Marca pago e a forma de pagamento juntos (mesa só sabe a forma na hora de
// fechar a conta; delivery/pdv confirmam o pagamento depois de entregue) —
// ou desfaz os dois quando formaPagamento vem null (staff escolheu errado).
export async function definirPagamentoPedido(supabase, pedidoId, formaPagamento) {
  const { error } = await supabase
    .from('pedidos')
    .update({ pago: Boolean(formaPagamento), forma_pagamento: formaPagamento || null })
    .eq('id', pedidoId);

  if (error) throw error;
}

// Fechar conta de mesa agora é por comanda (agrupa todas as rodadas) — ver
// fecharComanda em lib/comanda/comandas.js.
