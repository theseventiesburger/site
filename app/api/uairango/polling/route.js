import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { buscarEventosUairango, confirmarEventosUairango } from '@/lib/uairango/api';
import { processarEvento } from '@/lib/uairango/eventos';

// Polling de eventos de pedido (a doc pede uma consulta a cada 30s + ack dos
// eventos recebidos). Quem chama é um agendador (pg_cron do Supabase), não
// um navegador — por isso a autenticação é um segredo compartilhado no header
// x-cron-secret, igual o webhook de pedidos já faz com x-webhook-secret.
//
// Evento que processou sem erro é confirmado (ack); evento que deu erro NÃO
// é, então a UaiRango reentrega no próximo ciclo e a gente tenta de novo
// (criar_pedido_uairango é idempotente, não duplica).
function segredoValido(recebido) {
  const esperado = process.env.UAIRANGO_POLLING_SECRET;
  if (!esperado || !recebido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function rodar(request) {
  if (!segredoValido(request.headers.get('x-cron-secret'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  const merchantId = process.env.UAIRANGO_MERCHANT_ID;
  if (!merchantId) {
    return Response.json({ ok: false, erro: 'UAIRANGO_MERCHANT_ID não configurado' }, { status: 400 });
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const eventos = (await buscarEventosUairango(supabaseAdmin, merchantId)) ?? [];
    const confirmados = [];
    let falhas = 0;

    for (const evento of eventos) {
      try {
        await processarEvento(supabaseAdmin, evento);
        confirmados.push(evento.id);
      } catch (err) {
        falhas += 1;
        console.error('Erro processando evento UaiRango (polling):', evento, err);
      }
    }

    if (confirmados.length > 0) {
      await confirmarEventosUairango(supabaseAdmin, confirmados);
    }

    return Response.json({ ok: true, recebidos: eventos.length, confirmados: confirmados.length, falhas });
  } catch (err) {
    console.error('Erro no polling UaiRango:', err);
    return Response.json({ ok: false, erro: err.message }, { status: 502 });
  }
}

export { rodar as GET, rodar as POST };
