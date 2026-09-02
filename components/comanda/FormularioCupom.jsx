'use client';

import { useState } from 'react';
import { criarCupom, atualizarCupom } from '@/lib/comanda/cupons';
import { parsePrecoInput, formatarDataDigitada, dataDigitadaParaISO, isoParaDataDigitada } from '@/lib/comanda/formato';

export default function FormularioCupom({ supabase, cupom, onFechar, onSalvo }) {
  const modoEdicao = Boolean(cupom);

  const [codigo, setCodigo] = useState(cupom?.codigo ?? '');
  const [descricao, setDescricao] = useState(cupom?.descricao ?? '');
  const [tipoDesconto, setTipoDesconto] = useState(cupom?.tipo_desconto ?? 'percentual');
  const [valor, setValor] = useState(cupom?.valor ?? '');
  const [valorMinimoPedido, setValorMinimoPedido] = useState(cupom?.valor_minimo_pedido ?? '');
  const [validoDe, setValidoDe] = useState(isoParaDataDigitada(cupom?.valido_de));
  const [validoAte, setValidoAte] = useState(isoParaDataDigitada(cupom?.valido_ate));
  const [limiteUso, setLimiteUso] = useState(cupom?.limite_uso ?? '');
  const [ativo, setAtivo] = useState(cupom?.ativo ?? true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar(e) {
    e.preventDefault();
    if (!codigo || !valor) {
      setErro('Preencha o código e o valor do desconto.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const dados = {
        codigo,
        descricao,
        tipoDesconto,
        valor: parsePrecoInput(valor),
        valorMinimoPedido: valorMinimoPedido ? parsePrecoInput(valorMinimoPedido) : 0,
        validoDe: dataDigitadaParaISO(validoDe),
        validoAte: dataDigitadaParaISO(validoAte),
        limiteUso: limiteUso ? Number(limiteUso) : null,
        ativo,
      };

      if (modoEdicao) {
        await atualizarCupom(supabase, cupom.id, dados);
      } else {
        await criarCupom(supabase, dados);
      }

      onSalvo();
    } catch (err) {
      console.error(err);
      setErro(err?.message?.includes('duplicate') ? 'Já existe um cupom com esse código.' : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <form
        onSubmit={salvar}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-4 my-auto"
      >
        <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">
          {modoEdicao ? 'Editar cupom' : 'Novo cupom'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Código</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="BEMVINDO10"
              required
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-black uppercase tracking-wider focus:outline-none focus:border-sv-blue"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tipo</label>
            <select
              value={tipoDesconto}
              onChange={(e) => setTipoDesconto(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            >
              <option value="percentual">Percentual (%)</option>
              <option value="fixo">Valor fixo (R$)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Descrição (aparece no site)</label>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: 10% de desconto no primeiro pedido"
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {tipoDesconto === 'percentual' ? 'Desconto (%)' : 'Desconto (R$)'}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={tipoDesconto === 'percentual' ? '10' : '15,00'}
              required
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pedido mínimo (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={valorMinimoPedido}
              onChange={(e) => setValorMinimoPedido(e.target.value)}
              placeholder="0,00"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Válido de</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={validoDe}
              onChange={(e) => setValidoDe(formatarDataDigitada(e.target.value))}
              placeholder="dd/mm/aaaa"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Válido até</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={validoAte}
              onChange={(e) => setValidoAte(formatarDataDigitada(e.target.value))}
              placeholder="dd/mm/aaaa"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Limite de usos</label>
            <input
              type="number"
              min="1"
              value={limiteUso}
              onChange={(e) => setLimiteUso(e.target.value)}
              placeholder="Sem limite"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-sv-dark">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo (aparece no site e pode ser usado nos pedidos)
        </label>

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
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
