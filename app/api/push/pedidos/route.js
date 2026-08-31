import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { STATUS_LABEL, TIPO_LABEL } from '@/lib/comanda/constantes';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

function decidirAlvo(payload) {
  const { type, record, old_record } = payload;

  if (type === 'INSERT') {
    return {
      cargo: 'cozinha',
      titulo: 'Novo pedido',
      corpo: `Pedido #${record.numero} — ${TIPO_LABEL[record.tipo] ?? record.tipo}`,
    };
  }

  if (type === 'UPDATE' && old_record && old_record.status !== record.status) {
    return {
      cargo: 'garcom',
      titulo: 'Pedido atualizado',
      corpo: `Pedido #${record.numero} → ${STATUS_LABEL[record.status] ?? record.status}`,
    };
  }

  return null;
}

export async function POST(request) {
  const segredo = request.headers.get('x-webhook-secret');
  if (!segredo || segredo !== process.env.PEDIDOS_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await request.json();
  const alvo = decidirAlvo(payload);

  if (!alvo) {
    return Response.json({ ok: true, ignorado: true });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: perfis } = await supabaseAdmin
    .from('perfis')
    .select('user_id')
    .eq('cargo', alvo.cargo);

  const userIds = (perfis ?? []).map((p) => p.user_id);
  if (userIds.length === 0) {
    return Response.json({ ok: true, semDestinatarios: true });
  }

  const { data: inscricoes } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .in('user_id', userIds);

  const payloadNotificacao = JSON.stringify({ titulo: alvo.titulo, corpo: alvo.corpo });

  let enviados = 0;

  await Promise.all(
    (inscricoes ?? []).map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: { p256dh: inscricao.p256dh, auth: inscricao.auth_key },
          },
          payloadNotificacao
        );
        enviados += 1;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', inscricao.id);
        }
      }
    })
  );

  return Response.json({ ok: true, enviados });
}
