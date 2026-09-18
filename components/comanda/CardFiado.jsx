'use client';

import { useState } from 'react';
import SeletorCliente from '@/components/comanda/SeletorCliente';
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL, TIPO_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, formatarDataHora, tempoDecorrido } from '@/lib/comanda/formato';

// Fiado nunca é confirmado de volta como "fiado" — é sempre a forma que o
// dinheiro entrou de verdade agora.
const FORMAS_RECEBIMENTO = FORMAS_PAGAMENTO.filter((f) => f !== 'fiado');

export default function CardFiado({ grupo, supabase, onConfirmar, onAtribuirCliente }) {
  const [confirmando, setConfirmando] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [atribuindo, setAtribuindo] = useState(false);

  const primeiro = grupo.pedidos[0];
  const ehMesa = Boolean(primeiro.comanda_id);
  const semCliente = !ehMesa && !primeiro.cliente_id && !primeiro.cliente_telefone && !primeiro.cliente_nome;
  const destaque = ehMesa
    ? `Mesa ${primeiro.mesa_id}`
    : primeiro.cliente_nome || TIPO_LABEL[primeiro.tipo] || primeiro.tipo;
  const maisDeUmaVisita = !ehMesa && grupo.pedidos.length > 1;

  async function selecionarCliente(cliente) {
    try {
      await onAtribuirCliente(primeiro.id, cliente);
      setAtribuindo(false);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível atribuir o cliente. Tente de novo.');
    }
  }

  async function confirmar() {
    if (!formaPagamento) {
      setErro('Selecione a forma de pagamento recebida.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(grupo, formaPagamento);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível confirmar. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-amber-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-sv-dark text-lg">{destaque}</p>
          {!ehMesa && primeiro.cliente_telefone && (
            <p className="text-xs text-gray-500 font-medium">{primeiro.cliente_telefone}</p>
          )}
          {ehMesa && grupo.pedidos.length > 1 && (
            <p className="text-xs text-gray-400 font-bold">{grupo.pedidos.length} rodadas</p>
          )}
          {maisDeUmaVisita && (
            <p className="text-xs text-gray-400 font-bold">{grupo.pedidos.length} vendas fiado</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] text-gray-400 font-bold">desde {formatarDataHora(grupo.criadoEm)}</p>
          <p className="text-[11px] text-amber-600 font-bold">em aberto há {tempoDecorrido(grupo.criadoEm)}</p>
        </div>
      </div>

      {semCliente && (
        <div className="flex flex-col gap-2">
          {!atribuindo ? (
            <button
              type="button"
              onClick={() => setAtribuindo(true)}
              className="self-start text-[11px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red transition-colors duration-150"
            >
              ⚠ Sem cliente — atribuir agora
            </button>
          ) : (
            <SeletorCliente
              supabase={supabase}
              clienteSelecionado={null}
              onSelecionar={selecionarCliente}
              onLimpar={() => setAtribuindo(false)}
            />
          )}
        </div>
      )}

      {erro && !confirmando && <p className="text-sv-red text-xs font-bold">{erro}</p>}

      <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-3 max-h-48 overflow-y-auto">
        {grupo.pedidos.map((pedido) => (
          <div key={pedido.id} className={maisDeUmaVisita ? 'pb-2 border-b border-gray-50 last:border-0 last:pb-0' : ''}>
            {maisDeUmaVisita && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {formatarDataHora(pedido.created_at)}
                </span>
                <span className="text-[11px] font-bold text-sv-dark">{formatarBRL(pedido.total)}</span>
              </div>
            )}
            <ul className="flex flex-col gap-1">
              {(pedido.itens_pedido ?? []).map((item) => (
                <li key={item.id} className="text-xs">
                  <span className="font-black text-sv-dark">{item.quantidade}x</span>{' '}
                  <span className="text-sv-dark font-medium">{item.nome_produto}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Deve</span>
        <span className="font-black text-sv-dark text-xl">{formatarBRL(grupo.total)}</span>
      </div>

      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="bg-sv-dark text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-blue transition-colors duration-150"
        >
          Confirmar recebimento
        </button>
      ) : (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          >
            <option value="" disabled>Recebido em...</option>
            {FORMAS_RECEBIMENTO.map((f) => (
              <option key={f} value={f}>{FORMA_PAGAMENTO_LABEL[f]}</option>
            ))}
          </select>

          {erro && <p className="text-sv-red text-xs font-bold">{erro}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-[11px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando}
              className="flex-1 py-2.5 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-[11px] transition-colors duration-150 disabled:opacity-60"
            >
              {enviando ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
