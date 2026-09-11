'use client';

import { useState } from 'react';
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, parsePrecoInput } from '@/lib/comanda/formato';

// Fechar pedido avulso (delivery/pdv/retirada) — mesma opção de ajustar
// valor que a mesa já tem em FecharContaModal, só que pra um pedido só (não
// tem rodada nem taxa de serviço, mas tem taxa de entrega já embutida).
export default function FecharPedidoModal({ pedido, onFechar, onConfirmar }) {
  const itens = (pedido.itens_pedido ?? []).filter((item) => item.status !== 'cancelado');

  const [cortesiaIds, setCortesiaIds] = useState(
    () => new Set(itens.filter((item) => item.cortesia).map((item) => item.id))
  );
  const [valoresEditados, setValoresEditados] = useState({});
  const [descontoInput, setDescontoInput] = useState(
    Number(pedido.desconto) > 0 ? String(pedido.desconto).replace('.', ',') : ''
  );
  const [formaPagamento, setFormaPagamento] = useState(pedido.forma_pagamento ?? '');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  function toggleCortesia(itemId) {
    setCortesiaIds((atual) => {
      const novo = new Set(atual);
      if (novo.has(itemId)) novo.delete(itemId);
      else novo.add(itemId);
      return novo;
    });
  }

  function valorInputItem(item) {
    return valoresEditados[item.id] ?? String(Number(item.subtotal) || 0).replace('.', ',');
  }

  function atualizarValorItem(itemId, valor) {
    setValoresEditados((atual) => ({ ...atual, [itemId]: valor }));
  }

  const subtotal = itens.reduce((soma, item) => {
    if (cortesiaIds.has(item.id)) return soma;
    return soma + parsePrecoInput(valorInputItem(item));
  }, 0);
  const taxaEntrega = Number(pedido.taxa_entrega) || 0;
  const desconto = parsePrecoInput(descontoInput || '0');
  const total = Math.max(0, subtotal + taxaEntrega - desconto);

  async function confirmar(e) {
    e.preventDefault();
    if (!formaPagamento) {
      setErro('Selecione a forma de pagamento.');
      return;
    }
    if (desconto > subtotal + taxaEntrega) {
      setErro('O desconto não pode ser maior que o valor do pedido.');
      return;
    }
    if (Object.values(valoresEditados).some((valor) => parsePrecoInput(valor) < 0)) {
      setErro('O valor de um item não pode ser negativo.');
      return;
    }

    const itensPrecos = itens
      .filter((item) => {
        if (!(item.id in valoresEditados)) return false;
        return parsePrecoInput(valoresEditados[item.id]) !== Number(item.subtotal);
      })
      .map((item) => ({
        id: item.id,
        preco_unitario: Math.round((parsePrecoInput(valoresEditados[item.id]) / item.quantidade) * 100) / 100,
      }));

    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(pedido.id, {
        formaPagamento,
        desconto,
        itensCortesiaIds: [...cortesiaIds],
        itensPrecos,
      });
    } catch (err) {
      console.error(err);
      setErro('Não foi possível confirmar o pagamento. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <form
        onSubmit={confirmar}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-4 my-auto"
      >
        <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">
          Fechar pedido #{pedido.numero}
        </h2>

        <p className="text-[10px] text-gray-400 font-bold -mt-2">
          Toque no valor de um item pra ajustar (ex.: repasse de taxa de app de entrega)
        </p>

        <ul className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {itens.map((item) => {
            const emCortesia = cortesiaIds.has(item.id);
            return (
              <li
                key={item.id}
                className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-xs ${
                  emCortesia ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-[#F7F7F7]'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-black text-sv-dark">{item.quantidade}x</span>{' '}
                  <span className={`font-medium ${emCortesia ? 'text-green-700 line-through' : 'text-sv-dark'}`}>
                    {item.nome_produto}
                  </span>
                  {emCortesia ? (
                    <span className="block text-gray-400 font-bold">{formatarBRL(item.subtotal)}</span>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-gray-400 font-bold">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={valorInputItem(item)}
                        onChange={(e) => atualizarValorItem(item.id, e.target.value)}
                        className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold text-sv-dark focus:outline-none focus:border-sv-blue"
                      />
                    </div>
                  )}
                </div>
                <label className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-green-700">
                  <input type="checkbox" checked={emCortesia} onChange={() => toggleCortesia(item.id)} />
                  🎁 Cortesia
                </label>
              </li>
            );
          })}
        </ul>

        {taxaEntrega > 0 && (
          <div className="flex items-center justify-between text-sm font-bold text-sv-dark px-1">
            <span>Taxa de entrega</span>
            <span className="text-gray-400 font-black">{formatarBRL(taxaEntrega)}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Desconto (R$, opcional)</label>
          <input
            type="text"
            inputMode="decimal"
            value={descontoInput}
            onChange={(e) => setDescontoInput(e.target.value)}
            placeholder="0,00"
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Forma de pagamento</label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          >
            <option value="" disabled>Selecione</option>
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f} value={f}>{FORMA_PAGAMENTO_LABEL[f]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black text-sv-dark">{formatarBRL(total)}</span>
        </div>

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
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="flex-1 py-3 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
          >
            {enviando ? 'Confirmando...' : 'Confirmar pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
