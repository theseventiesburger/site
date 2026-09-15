import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { solicitarCancelamentoUairango } from '@/lib/uairango/api';

// Cancela um pedido vindo do UaiRango por iniciativa da loja — avisa a
// plataforma (com o motivo escolhido) e só depois marca cancelado aqui. Se
// o cancelamento tivesse vindo deles (evento CAN no webhook), a gente só
// atualiza o status local — não faz sentido "cancelar de volta" o que eles
// já cancelaram, por isso esse fluxo é separado.
export async function POST(request, { params }) {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const { cancellationCode, reason } = await request.json();

  if (!cancellationCode || !reason) {
    return Response.json({ erro: 'Selecione um motivo de cancelamento.' }, { status: 400 });
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .select('uairango_order_id')
    .eq('id', id)
    .maybeSingle();

  if (error || !pedido?.uairango_order_id) {
    return Response.json({ erro: 'Pedido não encontrado ou não veio do UaiRango.' }, { status: 404 });
  }

  try {
    await solicitarCancelamentoUairango(supabaseAdmin, pedido.uairango_order_id, cancellationCode, reason);
  } catch (err) {
    console.error(err);
    return Response.json({ erro: 'O UaiRango recusou o cancelamento. Tente de novo.' }, { status: 502 });
  }

  const { error: erroStatus } = await supabaseAdmin.from('pedidos').update({ status: 'cancelado' }).eq('id', id);
  if (erroStatus) {
    console.error('Cancelado no UaiRango mas falhou ao atualizar localmente:', erroStatus);
    return Response.json({ erro: 'Cancelado no UaiRango, mas houve falha ao atualizar aqui — atualize a página.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
