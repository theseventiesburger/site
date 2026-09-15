// Chamadas de pedido/evento da API do UaiRango Connect.

import { chamarUairango } from '@/lib/uairango/http';

export async function buscarPedidoUairango(supabaseAdmin, orderId) {
  return chamarUairango(supabaseAdmin, `/order/v1.0/orders/${orderId}`);
}

export async function confirmarPedidoUairango(supabaseAdmin, orderId) {
  return chamarUairango(supabaseAdmin, `/order/v1.0/orders/${orderId}/confirm`, { method: 'POST' });
}

export async function despacharPedidoUairango(supabaseAdmin, orderId) {
  return chamarUairango(supabaseAdmin, `/order/v1.0/orders/${orderId}/dispatch`, { method: 'POST' });
}

export async function pedidoProntoRetiradaUairango(supabaseAdmin, orderId) {
  return chamarUairango(supabaseAdmin, `/order/v1.0/orders/${orderId}/readyToPickup`, { method: 'POST' });
}

export async function motivosCancelamentoUairango(supabaseAdmin, orderId) {
  return chamarUairango(supabaseAdmin, `/order/v1.0/orders/${orderId}/cancellationReasons`);
}

export async function solicitarCancelamentoUairango(supabaseAdmin, orderId, cancellationCode, reason) {
  return chamarUairango(supabaseAdmin, `/order/v1.0/orders/${orderId}/requestCancellation`, {
    method: 'POST',
    body: JSON.stringify({ cancellationCode, reason }),
  });
}

export async function buscarEventosUairango(supabaseAdmin, merchantId) {
  return chamarUairango(supabaseAdmin, '/events/v1.0/events:polling?types=PLC,CFM,RTP,DSP,CAN&groups=ORDER_STATUS', {
    headers: { 'x-polling-merchants': merchantId },
  });
}

export async function confirmarEventosUairango(supabaseAdmin, eventIds) {
  return chamarUairango(supabaseAdmin, '/events/v1.0/events/acknowledgment', {
    method: 'POST',
    body: JSON.stringify(eventIds.map((id) => ({ id }))),
  });
}
