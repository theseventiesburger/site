import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { atualizarOpcaoDoAdicionalUairango } from '@/lib/uairango/atualizarCatalogo';

// Atualiza a opção do adicional em cada produto que o oferece (uma chamada
// por produto, em lotes) — pode levar alguns segundos.
export const maxDuration = 300;

// Chamada pela tela de Adicionais depois de salvar/ativar/desativar — leva
// preço e disponibilidade do complemento pra UaiRango. Adicional que ainda
// não foi sincronizado lá vira sincronizado: false em vez de quebrar a tela.
export async function POST(request) {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  if (!process.env.UAIRANGO_MERCHANT_ID) {
    return Response.json({ ok: true, sincronizado: false, motivo: 'UaiRango não configurado' });
  }

  const { adicionalId } = await request.json();
  if (!adicionalId) return Response.json({ erro: 'adicionalId é obrigatório' }, { status: 400 });

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: adicional } = await supabaseAdmin
    .from('adicionais')
    .select('id, nome, preco, ativo, categoria_id, categorias_adicionais(gratuita_tipos)')
    .eq('id', adicionalId)
    .maybeSingle();
  if (!adicional) return Response.json({ erro: 'Adicional não encontrado' }, { status: 404 });
  if (!adicional.categoria_id) return Response.json({ ok: true, sincronizado: false, motivo: 'sem categoria' });

  const { data: vinculos } = await supabaseAdmin
    .from('produto_categorias_adicionais')
    .select('produto_id')
    .eq('categoria_adicional_id', adicional.categoria_id);
  const produtoIds = (vinculos ?? []).map((v) => v.produto_id);

  try {
    const resultado = await atualizarOpcaoDoAdicionalUairango(
      supabaseAdmin,
      process.env.UAIRANGO_MERCHANT_ID,
      adicional,
      adicional.categorias_adicionais,
      produtoIds
    );
    return Response.json({ ok: true, ...resultado });
  } catch (err) {
    console.error('Falha ao atualizar complemento no UaiRango:', err);
    return Response.json({ ok: true, sincronizado: false, motivo: err.message });
  }
}
