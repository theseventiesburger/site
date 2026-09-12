import { createClient } from '@supabase/supabase-js';
import { buscarPedidoUairango, confirmarPedidoUairango } from '@/lib/uairango/api';
import { mapearPedidoUairango } from '@/lib/uairango/mapear';

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

async function processarEvento(supabaseAdmin, evento) {
  const codigo = evento.code ?? evento.fullCode;
  const orderId = evento.orderId;
  if (!orderId) return;

  if (codigo === 'PLC' || codigo === 'PLACED') {
    const pedidoUairango = await buscarPedidoUairango(supabaseAdmin, orderId);
    const dados = mapearPedidoUairango(pedidoUairango);

    await supabaseAdmin.rpc('criar_pedido_uairango', {
      p_uairango_order_id: dados.uairangoOrderId,
      p_tipo: dados.tipo,
      p_cliente_nome: dados.clienteNome,
      p_cliente_telefone: dados.clienteTelefone,
      p_endereco: dados.endereco,
      p_taxa_entrega: dados.taxaEntrega,
      p_forma_pagamento: dados.formaPagamento,
      p_pago: dados.pago,
      p_observacoes: dados.observacoes,
      p_itens: dados.itens,
    });

    // Aceitar o pedido direto (sem revisão manual) já significa confirmar
    // ele — se isso falhar, o pedido já está lançado aqui mas o UaiRango
    // ainda não sabe; melhor logar e deixar pra confirmar manualmente do
    // que travar a criação por causa da chamada de volta.
    await confirmarPedidoUairango(supabaseAdmin, orderId).catch((err) => {
      console.error(`Pedido ${orderId} criado mas falhou ao confirmar no UaiRango:`, err);
    });
    return;
  }

  if (codigo === 'CAN' || codigo === 'CANCELLED') {
    await supabaseAdmin.from('pedidos').update({ status: 'cancelado' }).eq('uairango_order_id', orderId);
  }

  // CFM/RTP/DSP (confirmado/pronto/despachado) são status que a própria
  // loja dispara pra fora — não precisa reagir a eles chegando de volta.
}
