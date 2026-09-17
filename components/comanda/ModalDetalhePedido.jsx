'use client';

import { useState } from 'react';
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL, TIPO_LABEL, PONTO_CARNE_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, formatarDataHora } from '@/lib/comanda/formato';

// Só faz sentido oferecer forma de pagamento de verdade aqui — reabrir um
// fiado só pra marcar "fiado" de novo não confirma recebimento nenhum.
const FORMAS_RECEBIMENTO = FORMAS_PAGAMENTO.filter((f) => f !== 'fiado');

// Ver os dados de um pedido já fechado (relatório) e, se ainda estiver
// pendente (fiado), confirmar que o dinheiro finalmente entrou.
export default function ModalDetalhePedido({ pedido, onFechar, onConfirmarRecebimento }) {
  const [formaPagamento, setFormaPagamento] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const itens = (pedido.itens_pedido ?? []).filter((item) => item.status !== 'cancelado');
  const destaque = pedido.tipo === 'mesa' ? `Mesa ${pedido.mesa_id} — Pedido #${pedido.numero}` : `Pedido #${pedido.numero}`;

  async function confirmar() {
    if (!formaPagamento) {
      setErro('Selecione a forma de pagamento recebida.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmarRecebimento(pedido, formaPagamento);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível confirmar o recebimento. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-4 my-auto">
        <div>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{TIPO_LABEL[pedido.tipo] ?? pedido.tipo}</span>
          <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">{destaque}</h2>
          <p className="text-xs text-gray-400 font-bold">{formatarDataHora(pedido.created_at)}</p>
        </div>

        <ul className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {itens.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-2 p-3 rounded-xl border border-gray-100 bg-[#F7F7F7] text-xs">
              <div className="min-w-0">
                <span className="font-black text-sv-dark">{item.quantidade}x</span>{' '}
                <span className="font-medium text-sv-dark">{item.nome_produto}</span>
                {item.ponto_carne && (
                  <span className="block text-sv-red font-black pl-4 uppercase tracking-wide">
                    🔥 {PONTO_CARNE_LABEL[item.ponto_carne] ?? item.ponto_carne}
                  </span>
                )}
                {(item.itens_pedido_adicionais ?? []).map((adicional) => (
                  <span key={adicional.id} className="block text-sv-blue font-bold pl-4">
                    + {adicional.nome_adicional}
                  </span>
                ))}
              </div>
              <span className="flex-shrink-0 font-bold text-sv-dark">{formatarBRL(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black text-sv-dark">{formatarBRL(pedido.total)}</span>
        </div>

        {pedido.pago ? (
          <p className="text-green-700 text-xs font-bold bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            Pago via {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] ?? pedido.forma_pagamento}
          </p>
        ) : (
          <>
            <p className="text-amber-700 text-xs font-bold bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              Pendente ({FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] ?? 'sem forma registrada'}) — assim que o cliente pagar, confirme abaixo.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Forma de pagamento recebida</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
              >
                <option value="" disabled>Selecione</option>
                {FORMAS_RECEBIMENTO.map((f) => (
                  <option key={f} value={f}>{FORMA_PAGAMENTO_LABEL[f]}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {erro && (
          <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-xs"
          >
            Fechar
          </button>
          {!pedido.pago && (
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando}
              className="flex-1 py-3 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
            >
              {enviando ? 'Confirmando...' : 'Confirmar recebimento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
