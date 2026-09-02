'use client';

import { useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarInsumos, alternarAtivoInsumo, registrarMovimento } from '@/lib/comanda/insumos';
import { parsePrecoInput } from '@/lib/comanda/formato';
import FormularioInsumo from '@/components/comanda/FormularioInsumo';

function CartaoInsumo({ insumo, onMudou }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [movimentoAberto, setMovimentoAberto] = useState(null); // null | 'entrada' | 'ajuste'
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [insumoEmEdicao, setInsumoEmEdicao] = useState(false);

  const abaixoDoMinimo = Number(insumo.estoque_atual) <= Number(insumo.estoque_minimo);

  async function toggleAtivo() {
    try {
      await alternarAtivoInsumo(supabase, insumo.id, !insumo.ativo);
      onMudou();
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmarMovimento(e) {
    e.preventDefault();
    if (!quantidade) return;

    setEnviando(true);
    setErro(null);
    try {
      const valor = parsePrecoInput(quantidade);
      await registrarMovimento(supabase, {
        insumoId: insumo.id,
        quantidade: movimentoAberto === 'entrada' ? Math.abs(valor) : valor,
        tipo: movimentoAberto,
        motivo: motivo || (movimentoAberto === 'entrada' ? 'Compra' : 'Ajuste manual'),
      });
      setQuantidade('');
      setMotivo('');
      setMovimentoAberto(null);
      onMudou();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível registrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-md border p-4 flex flex-col gap-3 ${insumo.ativo ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate">{insumo.nome}</p>
        {abaixoDoMinimo && (
          <span className="flex-shrink-0 bg-sv-red/10 text-sv-red text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
            Estoque baixo
          </span>
        )}
      </div>

      <p className={`text-2xl font-black ${abaixoDoMinimo ? 'text-sv-red' : 'text-sv-dark'}`}>
        {insumo.estoque_atual} <span className="text-xs font-bold text-gray-400 uppercase">{insumo.unidade}</span>
      </p>
      {Number(insumo.estoque_minimo) > 0 && (
        <p className="text-gray-400 text-[11px] font-bold -mt-2">Mínimo: {insumo.estoque_minimo} {insumo.unidade}</p>
      )}

      {movimentoAberto ? (
        <form onSubmit={confirmarMovimento} className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {movimentoAberto === 'entrada' ? 'Registrar entrada' : 'Ajustar estoque (+/-)'}
          </p>
          <input
            type="text"
            inputMode="decimal"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder={movimentoAberto === 'entrada' ? '10' : '-2'}
            autoFocus
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
          />
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (opcional)"
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
          />
          {erro && <p className="text-sv-red text-xs font-bold">{erro}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMovimentoAberto(null); setErro(null); }}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sv-dark font-black uppercase text-[10px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 py-2 rounded-lg bg-sv-blue hover:bg-sv-red text-white font-black uppercase text-[10px] disabled:opacity-60"
            >
              {enviando ? '...' : 'Confirmar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => setMovimentoAberto('entrada')} className="text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red">
            + Entrada
          </button>
          <span className="text-gray-300">·</span>
          <button type="button" onClick={() => setMovimentoAberto('ajuste')} className="text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red">
            Ajustar
          </button>
          <span className="text-gray-300">·</span>
          <button type="button" onClick={() => setInsumoEmEdicao(true)} className="text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red">
            Editar
          </button>
          <span className="text-gray-300">·</span>
          <button
            type="button"
            onClick={toggleAtivo}
            className={`text-[10px] font-black uppercase tracking-wider ${insumo.ativo ? 'text-gray-400 hover:text-sv-red' : 'text-green-600 hover:text-green-700'}`}
          >
            {insumo.ativo ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      )}

      {insumoEmEdicao && (
        <FormularioInsumo
          supabase={supabase}
          insumo={insumo}
          onFechar={() => setInsumoEmEdicao(false)}
          onSalvo={() => { setInsumoEmEdicao(false); onMudou(); }}
        />
      )}
    </div>
  );
}

export default function PainelEstoque({ insumosIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [insumos, setInsumos] = useState(insumosIniciais);
  const [novoInsumoAberto, setNovoInsumoAberto] = useState(false);

  async function recarregar() {
    setInsumos(await listarInsumos(supabase));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm font-medium">{insumos.length} insumos cadastrados</p>
        <button
          type="button"
          onClick={() => setNovoInsumoAberto(true)}
          className="bg-sv-blue hover:bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
        >
          + Novo Insumo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {insumos.map((insumo) => (
          <CartaoInsumo key={insumo.id} insumo={insumo} onMudou={recarregar} />
        ))}
      </div>

      {insumos.length === 0 && (
        <p className="text-gray-400 text-sm font-medium py-6 text-center">Nenhum insumo cadastrado ainda.</p>
      )}

      {novoInsumoAberto && (
        <FormularioInsumo
          supabase={supabase}
          onFechar={() => setNovoInsumoAberto(false)}
          onSalvo={() => { setNovoInsumoAberto(false); recarregar(); }}
        />
      )}
    </div>
  );
}
