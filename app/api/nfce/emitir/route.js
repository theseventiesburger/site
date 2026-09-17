import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { emitirNfce } from '@/lib/nfce/emitir';

export async function POST(request) {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  const { pedidoId } = await request.json();
  if (!pedidoId) {
    return Response.json({ erro: 'Informe pedidoId.' }, { status: 400 });
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const resultado = await emitirNfce(supabaseAdmin, pedidoId);
    return Response.json({ ok: true, resultado });
  } catch (err) {
    console.error(err);
    return Response.json({ erro: err.message || 'Não foi possível emitir a nota fiscal.' }, { status: 502 });
  }
}
