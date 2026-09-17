import { chamarFocusNfe } from '@/lib/nfce/http';
import { montarPayloadNfce, itensSemConfiguracaoFiscal } from '@/lib/nfce/mapear';
import { RESTAURANTE } from '@/lib/comanda/constantes';

async function marcarErro(supabaseAdmin, pedidoId, mensagem) {
  await supabaseAdmin
    .from('pedidos')
    .update({ nfce_status: 'erro', nfce_erro: mensagem })
    .eq('id', pedidoId);
}

export async function emitirNfce(supabaseAdmin, pedidoId) {
  const { data: pedido, error: erroPedido } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .eq('id', pedidoId)
    .single();
  if (erroPedido || !pedido) throw new Error('Pedido não encontrado.');

  if (pedido.nfce_status === 'autorizada') {
    throw new Error('Esse pedido já tem uma NFC-e autorizada.');
  }
  if (!pedido.pago) {
    throw new Error('O pedido precisa estar pago pra emitir a nota.');
  }

  const { data: itens, error: erroItens } = await supabaseAdmin
    .from('itens_pedido')
    .select('*, produto:produtos(id, nfce_ncm, nfce_cfop, nfce_csosn)')
    .eq('pedido_id', pedidoId)
    .neq('status', 'cancelado');
  if (erroItens) throw erroItens;

  const faltando = itensSemConfiguracaoFiscal(itens);
  if (faltando.length > 0) {
    const mensagem = `Produto(s) sem NCM/CFOP configurado: ${faltando.join(', ')}`;
    await marcarErro(supabaseAdmin, pedidoId, mensagem);
    throw new Error(mensagem);
  }

  const referencia = pedido.nfce_referencia || `pedido-${pedido.id}`;
  const payload = montarPayloadNfce({
    referencia,
    cnpjEmitente: RESTAURANTE.cnpj.replace(/\D/g, ''),
    presencial: pedido.tipo !== 'delivery',
    itens,
    valorTotal: pedido.total,
    formaPagamento: pedido.forma_pagamento,
  });

  await supabaseAdmin
    .from('pedidos')
    .update({ nfce_status: 'processando', nfce_referencia: referencia })
    .eq('id', pedidoId);

  let corpo;
  try {
    ({ corpo } = await chamarFocusNfe(`/v2/nfce?ref=${encodeURIComponent(referencia)}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  } catch (err) {
    await marcarErro(supabaseAdmin, pedidoId, err.message);
    throw err;
  }

  if (corpo?.status === 'autorizado') {
    await supabaseAdmin
      .from('pedidos')
      .update({
        nfce_status: 'autorizada',
        nfce_chave: corpo.chave_nfe,
        nfce_numero: corpo.numero,
        nfce_serie: corpo.serie,
        nfce_danfe_url: corpo.caminho_danfe,
        nfce_qrcode_url: corpo.qrcode_url,
        nfce_erro: null,
        nfce_emitida_em: new Date().toISOString(),
      })
      .eq('id', pedidoId);
    return corpo;
  }

  const mensagemErro = corpo?.mensagem_sefaz || corpo?.mensagem || 'Rejeitada pela SEFAZ.';
  await marcarErro(supabaseAdmin, pedidoId, mensagemErro);
  throw new Error(mensagemErro);
}
