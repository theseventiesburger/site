'use client';

import { useEffect, useState } from 'react';

// Cancelar um pedido que veio do UaiRango não pode ser só marcar
// cancelado aqui — a regra deles exige consultar os motivos disponíveis
// (a rota já pode devolver vazio, se o pedido não puder mais ser
// cancelado) e avisar a plataforma com o motivo escolhido antes de
// atualizar o status local.
export default function ModalCancelarUairango({ pedido, onFechar, onCancelado }) {
  const [motivos, setMotivos] = useState(null);
  const [motivoEscolhido, setMotivoEscolhido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/uairango/pedidos/${pedido.id}/motivos-cancelamento`)
      .then((r) => r.json())
      .then((dados) => {
        if (!ativo) return;
        if (dados.erro) setErro(dados.erro);
        else setMotivos(dados.motivos ?? []);
      })
      .catch(() => ativo && setErro('Não foi possível consultar os motivos de cancelamento.'));
    return () => {
      ativo = false;
    };
  }, [pedido.id]);

  async function confirmar() {
    const motivo = motivos?.find((m) => String(m.cancelCodeId) === motivoEscolhido);
    if (!motivo) {
      setErro('Selecione um motivo.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/uairango/pedidos/${pedido.id}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationCode: motivo.cancelCodeId, reason: motivo.description }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao cancelar.');
      onCancelado(pedido.id);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 flex flex-col gap-4">
        <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">
          Cancelar pedido #{pedido.numero}
        </h2>
        <p className="text-xs text-gray-400 font-bold -mt-2">
          Esse pedido veio do UaiRango — é obrigatório informar um motivo pra avisar a plataforma.
        </p>

        {motivos === null && !erro && <p className="text-sm text-gray-400 font-medium">Carregando motivos...</p>}

        {motivos !== null && motivos.length === 0 && (
          <p className="text-sv-red text-sm font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
            Esse pedido não pode mais ser cancelado pelo UaiRango.
          </p>
        )}

        {motivos !== null && motivos.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Motivo do cancelamento</label>
            <select
              value={motivoEscolhido}
              onChange={(e) => setMotivoEscolhido(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            >
              <option value="" disabled>Selecione</option>
              {motivos.map((m) => (
                <option key={m.cancelCodeId} value={m.cancelCodeId}>{m.description}</option>
              ))}
            </select>
          </div>
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
            Voltar
          </button>
          {motivos !== null && motivos.length > 0 && (
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando || !motivoEscolhido}
              className="flex-1 py-3 rounded-xl bg-sv-red hover:bg-sv-red/80 text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
            >
              {enviando ? 'Cancelando...' : 'Confirmar cancelamento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
