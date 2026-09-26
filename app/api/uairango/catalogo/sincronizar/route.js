import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { sincronizarCardapioUairango } from '@/lib/uairango/sincronizarCardapio';

// A sincronização completa cria um grupo de complementos por produto (~100
// chamadas), então precisa de mais tempo que o padrão da função.
export const maxDuration = 300;

export async function POST() {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  if (!process.env.UAIRANGO_MERCHANT_ID) {
    return Response.json({ erro: 'UAIRANGO_MERCHANT_ID não configurado ainda.' }, { status: 400 });
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const resultado = await sincronizarCardapioUairango(supabaseAdmin, process.env.UAIRANGO_MERCHANT_ID);
    return Response.json(resultado);
  } catch (err) {
    console.error(err);
    return Response.json({ erro: err.message || 'Não foi possível sincronizar o cardápio.' }, { status: 502 });
  }
}
