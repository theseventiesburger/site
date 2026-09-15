// Converte o formato de pedido do UaiRango Connect (GET /order/v1.0/orders/{id})
// pro formato que criar_pedido_uairango espera. Itens entram só com
// nome/preço (sem bater com produto cadastrado, a menos que o cardápio já
// tenha sido sincronizado — ver lib/uairango/catalog.js) — opções/adicionais
// viram texto dentro do próprio nome, já que não criamos itens_pedido_adicionais
// pra pedido externo.
//
// Mapeamento de forma de pagamento é um melhor-esforço: a documentação só
// mostrou "CREDIT_CARD" como exemplo — os outros valores (PIX, MONEY,
// MEAL_VOUCHER etc.) são um chute educado a partir do padrão comum desse
// tipo de plataforma (iFood usa nomenclatura parecida) e precisam ser
// conferidos contra um pedido real assim que a homologação sair. O mesmo
// vale pra troco (nenhum exemplo de pagamento em dinheiro na documentação —
// tenta os campos mais prováveis, com fallback pra null) e pro responsável
// do cupom (a doc só mostra o valor agregado em total.benefits, sem
// detalhar quem paga — fica null até aparecer um pedido real com cupom).
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
  if (!metodo || metodo.method !== 'MONEY') return null;
  const valor = metodo.cash?.changeFor ?? metodo.changeFor ?? metodo.change ?? null;
  return valor != null ? Number(valor) : null;
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
  const cupomValor = Number(pedidoUairango.total?.benefits ?? 0);

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
    cupomValor: cupomValor > 0 ? cupomValor : null,
    cupomResponsavel: cupomValor > 0 ? (pedidoUairango.total?.benefitsResponsible ?? null) : null,
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
