// Chamada HTTP autenticada pra API do UaiRango Connect — sempre server-side
// (webhook, rotas de API), nunca do navegador. Usado por api.js
// (pedidos/eventos), merchant.js (loja) e catalog.js (cardápio).

import { obterTokenValido } from '@/lib/uairango/auth';

const BASE_URL = 'https://merchant-api.uairango.com';

export async function chamarUairango(supabaseAdmin, caminho, opcoes = {}) {
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
