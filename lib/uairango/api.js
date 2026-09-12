// Chamadas à API de pedidos do UaiRango Connect — sempre server-side
// (webhook), nunca do navegador.

import { obterTokenValido } from '@/lib/uairango/auth';

const BASE_URL = 'https://merchant-api.uairango.com';

async function chamar(supabaseAdmin, caminho, opcoes = {}) {
  const token = await obterTokenValido(supabaseAdmin);

  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-env': process.env.UAIRANGO_ENV || 'production',
      ...opcoes.headers,
    },
  });

  if (!resposta.ok) {
    throw new Error(`UaiRango ${caminho} falhou (${resposta.status}): ${await resposta.text()}`);
  }

  // Alguns endpoints (confirm/dispatch) respondem sem corpo.
  const texto = await resposta.text();
  return texto ? JSON.parse(texto) : null;
}

export async function buscarPedidoUairango(supabaseAdmin, orderId) {
  return chamar(supabaseAdmin, `/order/v1.0/orders/${orderId}`);
}

export async function confirmarPedidoUairango(supabaseAdmin, orderId) {
  return chamar(supabaseAdmin, `/order/v1.0/orders/${orderId}/confirm`, { method: 'POST' });
}

export async function despacharPedidoUairango(supabaseAdmin, orderId) {
  return chamar(supabaseAdmin, `/order/v1.0/orders/${orderId}/dispatch`, { method: 'POST' });
}

export async function pedidoProntoRetiradaUairango(supabaseAdmin, orderId) {
  return chamar(supabaseAdmin, `/order/v1.0/orders/${orderId}/readyToPickup`, { method: 'POST' });
}

export async function motivosCancelamentoUairango(supabaseAdmin, orderId) {
  return chamar(supabaseAdmin, `/order/v1.0/orders/${orderId}/cancellationReasons`);
}

export async function solicitarCancelamentoUairango(supabaseAdmin, orderId, cancellationCode, reason) {
  return chamar(supabaseAdmin, `/order/v1.0/orders/${orderId}/requestCancellation`, {
    method: 'POST',
    body: JSON.stringify({ cancellationCode, reason }),
  });
}

export async function buscarEventosUairango(supabaseAdmin, merchantId) {
  return chamar(supabaseAdmin, '/events/v1.0/events:polling?types=PLC,CFM,RTP,DSP,CAN&groups=ORDER_STATUS', {
    headers: { 'x-polling-merchants': merchantId },
  });
}

export async function confirmarEventosUairango(supabaseAdmin, eventIds) {
  return chamar(supabaseAdmin, '/events/v1.0/events/acknowledgment', {
    method: 'POST',
    body: JSON.stringify(eventIds.map((id) => ({ id }))),
  });
}
