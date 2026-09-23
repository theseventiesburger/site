import { createClient } from '@supabase/supabase-js';
import { processarEvento } from '@/lib/uairango/eventos';

// Recebe eventos de pedido do UaiRango Connect. A documentação deles não
// mostra um payload de webhook separado (só o formato do polling:
// { id, code, fullCode, orderId, merchantId, createdAt }) — assume que o
// webhook manda a mesma coisa, um evento por request ou uma lista deles.
// Isso PRECISA ser conferido assim que o primeiro webhook real chegar (dá
// pra logar o corpo bruto direto no Vercel pra ver o formato de verdade).
//
// Sem verificação de assinatura: a doc não documenta um segredo de webhook
// como o do WhatsApp (x-hub-signature-256). Mitiga isso buscando os
// detalhes do pedido direto na API deles (com nosso token) em vez de
// confiar no corpo do webhook — na pior das hipóteses alguém só consegue
// re-disparar a criação de um pedido que já existe de verdade na sua conta.
export async function POST(request) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, erro: 'corpo inválido' }, { status: 400 });
  }

  const eventos = Array.isArray(payload) ? payload : [payload];

  for (const evento of eventos) {
    try {
      await processarEvento(supabaseAdmin, evento);
    } catch (err) {
      // Loga e segue pros próximos eventos do lote — um pedido com erro
      // não pode travar os outros. UaiRango reenvia se a gente não
      // reconhecer, mas aqui não estamos usando o modelo de polling/ack,
      // então só registramos o erro pra investigar depois.
      console.error('Erro processando evento UaiRango:', evento, err);
    }
  }

  return Response.json({ ok: true });
}
