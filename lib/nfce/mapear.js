// Monta o payload de emissão de NFC-e a partir de um pedido + seus itens
// (já com o produto correspondente carregado, pra pegar ncm/cfop/csosn).

// Tabela oficial de formas de pagamento da SEFAZ (4.1.6). Só os quatro
// primeiros (dinheiro/crédito/débito/vale-refeição) têm exemplo confirmado
// na documentação da Focus — pix e os demais são o código padrão da
// tabela, mas nunca testados contra a API de verdade; conferir com o
// contador antes de confiar cegamente neles em produção.
const MAPA_FORMA_PAGAMENTO = {
  dinheiro: '01',
  credito: '03',
  debito: '04',
  vale_refeicao: '11',
  pix: '17',
  online: '99', // "outros" — não há um código específico pra pagamento online genérico
  fiado: '99', // venda sem pagamento à vista; ajustar com o contador se houver tratamento melhor
};

export function itensSemConfiguracaoFiscal(itensComProduto) {
  return itensComProduto
    .filter((item) => !item.produto?.nfce_ncm || !item.produto?.nfce_cfop)
    .map((item) => item.nome_produto);
}

function montarItemNfce(item, index) {
  const produto = item.produto;
  const quantidade = Number(item.quantidade);
  // Adicionais (itens_pedido_adicionais) entram diluídos no valor unitário
  // via subtotal — não viram linha própria na nota. Simplificação
  // deliberada pra não multiplicar a quantidade de itens fiscais por
  // combinação de adicionais.
  const valorUnitario = Math.round((Number(item.subtotal) / quantidade) * 100) / 100;

  return {
    numero_item: index + 1,
    codigo_produto: produto.id,
    descricao: item.nome_produto,
    codigo_ncm: produto.nfce_ncm,
    cfop: produto.nfce_cfop,
    unidade_comercial: 'UN',
    quantidade_comercial: quantidade,
    valor_unitario_comercial: valorUnitario,
    valor_bruto: Number(item.subtotal),
    unidade_tributavel: 'UN',
    quantidade_tributavel: quantidade,
    valor_unitario_tributavel: valorUnitario,
    icms_origem: '0',
    icms_situacao_tributaria: produto.nfce_csosn,
  };
}

export function montarPayloadNfce({ referencia, cnpjEmitente, presencial, itens, valorTotal, formaPagamento }) {
  return {
    natureza_operacao: 'VENDA AO CONSUMIDOR',
    data_emissao: new Date().toISOString(),
    presenca_comprador: presencial ? '1' : '4',
    modalidade_frete: '9',
    local_destino: '1',
    indicador_inscricao_estadual_destinatario: '9',
    cnpj_emitente: cnpjEmitente,
    items: itens.map(montarItemNfce),
    formas_pagamento: [
      {
        forma_pagamento: MAPA_FORMA_PAGAMENTO[formaPagamento] || '99',
        valor_pagamento: Number(valorTotal),
      },
    ],
  };
}
