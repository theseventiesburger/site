// Chamadas da seção "Merchant" da API do UaiRango Connect — dados e status
// da loja. merchantId é o id que o UaiRango atribui ao estabelecimento
// (pega com listarLojasUairango — normalmente só existe um, o próprio
// restaurante).

import { chamarUairango } from '@/lib/uairango/http';

export async function listarLojasUairango(supabaseAdmin) {
  return chamarUairango(supabaseAdmin, '/merchant/v1.0/merchants');
}

export async function detalhesLojaUairango(supabaseAdmin, merchantId) {
  return chamarUairango(supabaseAdmin, `/merchant/v1.0/merchants/${merchantId}`);
}

export async function statusLojaUairango(supabaseAdmin, merchantId) {
  return chamarUairango(supabaseAdmin, `/merchant/v1.0/merchants/${merchantId}/status`);
}

// operations: [{ name: 'DELIVERY'|'TAKEOUT', status: 'AVAILABLE'|'UNAVAILABLE', estimatedTime }]
export async function atualizarStatusLojaUairango(supabaseAdmin, merchantId, status, operations) {
  return chamarUairango(supabaseAdmin, `/merchant/v1.0/merchants/${merchantId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, operations }),
  });
}
