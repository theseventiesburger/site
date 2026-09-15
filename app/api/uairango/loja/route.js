import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { statusLojaUairango, atualizarStatusLojaUairango } from '@/lib/uairango/merchant';

function supabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  if (!process.env.UAIRANGO_MERCHANT_ID) {
    return Response.json({ erro: 'UAIRANGO_MERCHANT_ID não configurado ainda.' }, { status: 400 });
  }

  try {
    const status = await statusLojaUairango(supabaseAdminClient(), process.env.UAIRANGO_MERCHANT_ID);
    return Response.json({ status });
  } catch (err) {
    console.error(err);
    return Response.json({ erro: 'Não foi possível consultar o status da loja no UaiRango.' }, { status: 502 });
  }
}

// Abre ou fecha as duas operações (delivery e retirada) juntas — não expõe
// controle separado por operação, pra manter o botão simples de usar.
export async function POST(request) {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  if (!process.env.UAIRANGO_MERCHANT_ID) {
    return Response.json({ erro: 'UAIRANGO_MERCHANT_ID não configurado ainda.' }, { status: 400 });
  }

  const { aberta } = await request.json();
  const status = aberta ? 'AVAILABLE' : 'UNAVAILABLE';

  try {
    await atualizarStatusLojaUairango(supabaseAdminClient(), process.env.UAIRANGO_MERCHANT_ID, status, [
      { name: 'DELIVERY', status, estimatedTime: 30 },
      { name: 'TAKEOUT', status, estimatedTime: 20 },
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ erro: 'Não foi possível atualizar o status da loja no UaiRango.' }, { status: 502 });
  }
}
