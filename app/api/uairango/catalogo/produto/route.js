import { createClient } from '@supabase/supabase-js';
import { exigirStaff } from '@/lib/comanda/authApi';
import { atualizarItemDoProdutoUairango } from '@/lib/uairango/atualizarCatalogo';

// Chamada pela tela de Produtos depois de salvar/ativar/desativar — leva
// preço e disponibilidade do produto pra UaiRango. Produto que ainda não
// foi sincronizado lá é simplesmente ignorado (sincronizado: false).
export async function POST(request) {
  const staff = await exigirStaff();
  if (!staff) return new Response('Unauthorized', { status: 401 });

  if (!process.env.UAIRANGO_MERCHANT_ID) {
    return Response.json({ ok: true, sincronizado: false, motivo: 'UaiRango não configurado' });
  }

  const { produtoId } = await request.json();
  if (!produtoId) return Response.json({ erro: 'produtoId é obrigatório' }, { status: 400 });

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: produto } = await supabaseAdmin
    .from('produtos')
    .select('id, nome, preco, preco_promocional, ativo')
    .eq('id', produtoId)
    .maybeSingle();
  if (!produto) return Response.json({ erro: 'Produto não encontrado' }, { status: 404 });

  try {
    const resultado = await atualizarItemDoProdutoUairango(supabaseAdmin, process.env.UAIRANGO_MERCHANT_ID, produto);
    return Response.json({ ok: true, ...resultado });
  } catch (err) {
    console.error('Falha ao atualizar item no UaiRango:', err);
    return Response.json({ erro: err.message }, { status: 502 });
  }
}
