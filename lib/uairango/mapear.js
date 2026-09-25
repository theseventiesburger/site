// Converte o formato de pedido do UaiRango Connect (GET /order/v1.0/orders/{id})
// pro formato que criar_pedido_uairango espera. Itens entram só com
// nome/preço (sem bater com produto cadastrado, a menos que o cardápio já
// tenha sido sincronizado — ver lib/uairango/catalog.js) — opções/adicionais
// viram texto dentro do próprio nome, já que não criamos itens_pedido_adicionais
// pra pedido externo.
//
// Conferido contra pedidos reais do sandbox: dinheiro vem como CASH com o
// troco em cash.changeFor, cartão traz card.brand, e o cupom vem em
// benefits[] (valor + sponsorshipValues[].name com quem paga o desconto,
// ex: UAIRANGO ou MERCHANT). Os outros métodos (PIX, MEAL_VOUCHER etc.)
// seguem um chute educado até aparecer um pedido real com eles.
const MAPA_FORMA_PAGAMENTO = {
  CREDIT_CARD: 'credito',
  DEBIT_CARD: 'debito',
  MONEY: 'dinheiro',
  CASH: 'dinheiro',
  PIX: 'pix',
  MEAL_VOUCHER: 'vale_refeicao',
  FOOD_VOUCHER: 'vale_refeicao',
};

function metodoPrincipal(pedidoUairango) {
  return pedidoUairango.payments?.methods?.[0];
}

function formaPagamento(pedidoUairango) {
  const metodo = metodoPrincipal(pedidoUairango)?.method;
  return MAPA_FORMA_PAGAMENTO[metodo] ?? 'online';
}

function troco(pedidoUairango) {
  const metodo = metodoPrincipal(pedidoUairango);
  if (!metodo || (metodo.method !== 'CASH' && metodo.method !== 'MONEY')) return null;
  const valor = metodo.cash?.changeFor ?? metodo.changeFor ?? metodo.change ?? null;
  return valor != null ? Number(valor) : null;
}

const NOME_PATROCINADOR = { UAIRANGO: 'UaiRango', MERCHANT: 'Loja' };

// Desconto do pedido: soma os benefits e junta quem patrocina (a plataforma
// ou a própria loja) — é o que o checklist de homologação manda exibir.
function cupom(pedidoUairango) {
  const beneficios = pedidoUairango.benefits ?? [];
  const somaBeneficios = beneficios.reduce((soma, b) => soma + Number(b.value ?? 0), 0);
  const valor = somaBeneficios || Number(pedidoUairango.total?.benefits ?? 0);

  const patrocinadores = [
    ...new Set(
      beneficios
        .flatMap((b) => b.sponsorshipValues ?? [])
        .filter((p) => Number(p.value ?? 0) > 0 && p.name)
        .map((p) => NOME_PATROCINADOR[p.name] ?? p.name)
    ),
  ];

  return {
    valor: valor > 0 ? valor : null,
    responsavel: valor > 0 && patrocinadores.length > 0 ? patrocinadores.join(', ') : null,
  };
}

function nomeComOpcoes(item) {
  const opcoes = (item.options ?? []).map((o) => o.name).filter(Boolean);
  return opcoes.length > 0 ? `${item.name} (${opcoes.join(', ')})` : item.name;
}

export function mapearPedidoUairango(pedidoUairango) {
  const tipo = pedidoUairango.orderType === 'TAKEOUT' ? 'retirada' : 'delivery';
  // pending > 0 quer dizer que ainda falta cobrar na entrega (cartão na
  // maquininha, dinheiro etc.) — mesma ideia de "fiado" que já existe no
  // sistema: só marca pago quando o dinheiro realmente já entrou.
  const pago = Number(pedidoUairango.payments?.pending ?? 0) === 0;
  const desconto = cupom(pedidoUairango);

  return {
    uairangoOrderId: pedidoUairango.id,
    tipo,
    clienteNome: pedidoUairango.customer?.name ?? null,
    clienteTelefone: pedidoUairango.customer?.phone?.number ?? null,
    endereco: tipo === 'delivery' ? (pedidoUairango.delivery?.deliveryAddress?.formattedAddress ?? null) : null,
    taxaEntrega: Number(pedidoUairango.total?.deliveryFee ?? 0),
    formaPagamento: formaPagamento(pedidoUairango),
    pago,
    observacoes: pedidoUairango.delivery?.observations || null,
    bandeiraCartao: metodoPrincipal(pedidoUairango)?.card?.brand ?? null,
    troco: troco(pedidoUairango),
    cupomValor: desconto.valor,
    cupomResponsavel: desconto.responsavel,
    itens: (pedidoUairango.items ?? []).map((item) => ({
      nome: nomeComOpcoes(item),
      // totalPrice já inclui os adicionais (optionsPrice) — divide pela
      // quantidade pra guardar como preço unitário, igual o resto do
      // sistema já faz quando o valor de um item é ajustado na mão.
      preco_unitario: Math.round((Number(item.totalPrice) / Number(item.quantity)) * 100) / 100,
      quantidade: item.quantity,
      observacao: item.observations || null,
      externalCode: item.externalCode ?? null,
    })),
  };
}
