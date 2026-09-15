import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { motivosCancelamentoUairango } from '@/lib/uairango/api';

// Consultar os motivos disponíveis é obrigatório antes de pedir um
// cancelamento (regra do próprio UaiRango) — id na rota é o `pedidos.id`
// nosso, não o orderId deles.
export async function GET(request, { params }) {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
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
    const motivos = await motivosCancelamentoUairango(supabaseAdmin, pedido.uairango_order_id);
    return Response.json({ motivos });
  } catch (err) {
    console.error(err);
    return Response.json({ erro: 'Não foi possível consultar os motivos de cancelamento.' }, { status: 502 });
  }
}
