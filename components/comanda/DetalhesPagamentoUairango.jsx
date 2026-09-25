import { FORMA_PAGAMENTO_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL } from '@/lib/comanda/formato';

// Pagamento de pedido vindo do UaiRango: forma/bandeira, se já foi pago
// online pela plataforma ou é pra cobrar, troco e cupom (valor + quem
// paga). Aparece onde o pedido é visto (Cozinha, Pedidos Abertos e
// detalhe do Relatório) — pedido pago online nunca passa por Pedidos
// Abertos, então só lá ninguém veria esses dados.
export default function DetalhesPagamentoUairango({ pedido }) {
  if (!pedido.uairango_order_id) return null;

  const forma = FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] ?? pedido.forma_pagamento;

  return (
    <div className="flex flex-col gap-0.5 text-xs font-bold">
      <span className="text-sv-dark">
        💳 {pedido.uairango_bandeira_cartao || forma}
        <span className="text-gray-400 font-medium">
          {pedido.pago ? ' · pago online (plataforma)' : ' · cobrar na entrega/retirada'}
        </span>
      </span>
      {pedido.uairango_troco > 0 && (
        <span className="text-sv-red">💵 Levar troco pra {formatarBRL(pedido.uairango_troco)}</span>
      )}
      {pedido.uairango_cupom_valor > 0 && (
        <span className="text-sv-blue">
          🎫 Cupom {formatarBRL(pedido.uairango_cupom_valor)}
          {pedido.uairango_cupom_responsavel ? ` (${pedido.uairango_cupom_responsavel})` : ''}
        </span>
      )}
    </div>
  );
}
