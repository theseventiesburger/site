'use client';

import { useState } from 'react';
import { atualizarComboConfig } from '@/lib/comanda/comboConfig';

export default function ConfiguracaoCombo({ supabase, comboConfigInicial, produtos }) {
  const [fritasProdutoId, setFritasProdutoId] = useState(comboConfigInicial?.fritas_produto_id ?? '');
  const [bebidaProdutoId, setBebidaProdutoId] = useState(comboConfigInicial?.bebida_produto_id ?? '');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      await atualizarComboConfig(supabase, {
        fritasProdutoId: fritasProdutoId || null,
        bebidaProdutoId: bebidaProdutoId || null,
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-black text-sv-dark uppercase tracking-tight">Configuração do combo</h3>
        <p className="text-gray-400 text-xs font-medium mt-0.5">
          Fritas e bebida que entram em qualquer produto marcado &quot;Pode virar combo&quot;.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Fritas do combo</label>
          <select
            value={fritasProdutoId}
            onChange={(e) => setFritasProdutoId(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          >
            <option value="">Selecione</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bebida do combo</label>
          <select
            value={bebidaProdutoId}
            onChange={(e) => setBebidaProdutoId(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          >
            <option value="">Selecione</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p className="text-sv-red text-xs font-bold">{erro}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="bg-sv-dark text-white font-black px-5 py-2.5 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-blue transition-colors duration-150 disabled:opacity-60 self-start"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        {salvo && <span className="text-green-700 text-xs font-bold">Salvo!</span>}
      </div>
    </div>
  );
}
