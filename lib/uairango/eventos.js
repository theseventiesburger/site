// Reage a um evento de pedido do UaiRango (PLC/CAN). Compartilhado entre o
// webhook (/api/uairango/webhook) e o polling (/api/uairango/polling) —
// criar_pedido_uairango é idempotente por uairango_order_id, então o mesmo
// evento chegando pelos dois caminhos (ou reentregue) não duplica pedido.

import { buscarPedidoUairango, confirmarPedidoUairango } from '@/lib/uairango/api';
import { mapearPedidoUairango } from '@/lib/uairango/mapear';

export async function processarEvento(supabaseAdmin, evento) {
  const codigo = evento.code ?? evento.fullCode;
  const orderId = evento.orderId;
  if (!orderId) return;

  if (codigo === 'PLC' || codigo === 'PLACED') {
    const pedidoUairango = await buscarPedidoUairango(supabaseAdmin, orderId);
    const dados = mapearPedidoUairango(pedidoUairango);

    await supabaseAdmin.rpc('criar_pedido_uairango', {
      p_uairango_order_id: dados.uairangoOrderId,
      p_tipo: dados.tipo,
      p_cliente_nome: dados.clienteNome,
      p_cliente_telefone: dados.clienteTelefone,
      p_endereco: dados.endereco,
      p_taxa_entrega: dados.taxaEntrega,
      p_forma_pagamento: dados.formaPagamento,
      p_pago: dados.pago,
      p_observacoes: dados.observacoes,
      p_itens: dados.itens,
      p_bandeira_cartao: dados.bandeiraCartao,
      p_troco: dados.troco,
      p_cupom_valor: dados.cupomValor,
      p_cupom_responsavel: dados.cupomResponsavel,
    });

    // Aceitar o pedido direto (sem revisão manual) já significa confirmar
    // ele — se isso falhar, o pedido já está lançado aqui mas o UaiRango
    // ainda não sabe; melhor logar e deixar pra confirmar manualmente do
    // que travar a criação por causa da chamada de volta.
    await confirmarPedidoUairango(supabaseAdmin, orderId).catch((err) => {
      console.error(`Pedido ${orderId} criado mas falhou ao confirmar no UaiRango:`, err);
    });
    return;
  }

  if (codigo === 'CAN' || codigo === 'CANCELLED') {
    await supabaseAdmin.from('pedidos').update({ status: 'cancelado' }).eq('uairango_order_id', orderId);
  }

  // CFM/RTP/DSP (confirmado/pronto/despachado) são status que a própria
  // loja dispara pra fora — não precisa reagir a eles chegando de volta.
}
