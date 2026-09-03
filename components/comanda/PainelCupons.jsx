'use client';

import { useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarTodosCupons, alternarAtivoCupom } from '@/lib/comanda/cupons';
import { formatarBRL, isoParaDataDigitada } from '@/lib/comanda/formato';
import FormularioCupom from '@/components/comanda/FormularioCupom';

function descreverDesconto(cupom) {
  return cupom.tipo_desconto === 'percentual' ? `${cupom.valor}% OFF` : `${formatarBRL(cupom.valor)} OFF`;
}

function descreverRegras(cupom) {
  const regras = [];
  if (Number(cupom.valor_minimo_pedido) > 0) regras.push(`mín. ${formatarBRL(cupom.valor_minimo_pedido)}`);
  if (cupom.valido_de) regras.push(`de ${isoParaDataDigitada(cupom.valido_de)}`);
  if (cupom.valido_ate) regras.push(`até ${isoParaDataDigitada(cupom.valido_ate)}`);
  if (cupom.limite_uso) regras.push(`${cupom.usos_realizados}/${cupom.limite_uso} usos`);
  else if (cupom.usos_realizados > 0) regras.push(`${cupom.usos_realizados} usos`);
  return regras.join(' · ');
}

export default function PainelCupons({ cuponsIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [cupons, setCupons] = useState(cuponsIniciais);
  const [cupomEmEdicao, setCupomEmEdicao] = useState(undefined); // undefined = fechado, null = criar, objeto = editar
  const [erro, setErro] = useState(null);

  async function recarregar() {
    const dados = await listarTodosCupons(supabase);
    setCupons(dados);
    setCupomEmEdicao(undefined);
  }

  async function toggleAtivo(cupom) {
    setCupons((atual) => atual.map((c) => (c.id === cupom.id ? { ...c, ativo: !c.ativo } : c)));
    setErro(null);
    try {
      await alternarAtivoCupom(supabase, cupom.id, !cupom.ativo);
    } catch (err) {
      console.error(err);
      // Desfaz na tela — sem isso o cupom parecia desativado enquanto
      // continuava valendo de verdade pro cliente no banco.
      setCupons((atual) => atual.map((c) => (c.id === cupom.id ? { ...c, ativo: cupom.ativo } : c)));
      setErro(`Não foi possível ${cupom.ativo ? 'desativar' : 'ativar'} o cupom "${cupom.codigo}". Tente de novo.`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm font-medium">{cupons.length} cupons cadastrados</p>
        <button
          type="button"
          onClick={() => setCupomEmEdicao(null)}
          className="bg-sv-blue hover:bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
        >
          + Novo Cupom
        </button>
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cupons.map((cupom) => (
          <div
            key={cupom.id}
            className={`bg-white rounded-2xl shadow-md border p-4 flex flex-col gap-2 ${
              cupom.ativo ? 'border-gray-100' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-black text-sv-dark text-sm uppercase tracking-widest">{cupom.codigo}</span>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-sv-blue/10 text-sv-blue flex-shrink-0">
                {descreverDesconto(cupom)}
              </span>
            </div>

            {cupom.descricao && <p className="text-gray-500 text-xs font-medium">{cupom.descricao}</p>}
            {descreverRegras(cupom) && (
              <p className="text-gray-400 text-[11px] font-bold">{descreverRegras(cupom)}</p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setCupomEmEdicao(cupom)}
                className="text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red"
              >
                Editar
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => toggleAtivo(cupom)}
                className={`text-[10px] font-black uppercase tracking-wider ${
                  cupom.ativo ? 'text-gray-400 hover:text-sv-red' : 'text-green-600 hover:text-green-700'
                }`}
              >
                {cupom.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {cupons.length === 0 && (
        <p className="text-gray-400 text-sm font-medium py-6 text-center">Nenhum cupom cadastrado ainda.</p>
      )}

      {cupomEmEdicao !== undefined && (
        <FormularioCupom
          supabase={supabase}
          cupom={cupomEmEdicao}
          onFechar={() => setCupomEmEdicao(undefined)}
          onSalvo={recarregar}
        />
      )}
    </div>
  );
}
