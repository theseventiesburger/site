'use client';

import { formatarBRL, parsePrecoInput } from '@/lib/comanda/formato';

// Desconto na hora de fechar: em R$ ou em % sobre o valor dos itens. O
// banco sempre guarda em R$ — a porcentagem só existe aqui, convertida
// antes de confirmar.
export function calcularDescontoFechamento(modo, entrada, baseItens) {
  const numero = parsePrecoInput(entrada || '0');
  if (modo === 'percentual') return Math.round(baseItens * (numero / 100) * 100) / 100;
  return numero;
}

export default function CampoDesconto({ modo, onModo, entrada, onEntrada, baseItens }) {
  const descontoEmReais = calcularDescontoFechamento(modo, entrada, baseItens);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Desconto (opcional)</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-black">
          {[
            { chave: 'valor', label: 'R$' },
            { chave: 'percentual', label: '%' },
          ].map((opcao) => (
            <button
              key={opcao.chave}
              type="button"
              onClick={() => onModo(opcao.chave)}
              className={`px-3 py-1 transition-colors duration-150 ${
                modo === opcao.chave ? 'bg-sv-dark text-white' : 'text-gray-400 hover:text-sv-dark'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={entrada}
        onChange={(e) => onEntrada(e.target.value)}
        placeholder={modo === 'percentual' ? '10' : '0,00'}
        className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
      />
      {modo === 'percentual' && descontoEmReais > 0 && (
        <p className="text-[11px] text-gray-400 font-bold">= {formatarBRL(descontoEmReais)} sobre os itens</p>
      )}
    </div>
  );
}
