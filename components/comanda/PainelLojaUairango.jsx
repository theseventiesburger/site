'use client';

import { useEffect, useState } from 'react';

export default function PainelLojaUairango() {
  const [status, setStatus] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch('/api/uairango/loja');
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao consultar.');
      setStatus(dados.status);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    // Carga inicial mesmo — `carregar` também é reaproveitado pelo botão
    // de alternar, não dá pra virar só uma assinatura de efeito.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, []);

  async function alternar(aberta) {
    setAtualizando(true);
    setErro(null);
    try {
      const resposta = await fetch('/api/uairango/loja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aberta }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao atualizar.');
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
      {carregando && <p className="text-gray-400 text-sm font-medium">Consultando status...</p>}

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}

      {!carregando && status && (
        <ul className="flex flex-col gap-2">
          {status.map((op) => (
            <li
              key={op.operation}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-[#F7F7F7]"
            >
              <span className="font-black text-sv-dark text-sm uppercase">
                {op.operation === 'DELIVERY' ? 'Delivery' : op.operation === 'TAKEOUT' ? 'Retirada' : op.operation}
              </span>
              <span
                className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  op.available ? 'bg-green-100 text-green-700' : 'bg-sv-red/10 text-sv-red'
                }`}
              >
                {op.available ? 'Aberta' : 'Fechada'}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => alternar(true)}
          disabled={atualizando}
          className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
        >
          Abrir loja
        </button>
        <button
          type="button"
          onClick={() => alternar(false)}
          disabled={atualizando}
          className="flex-1 py-3 rounded-xl bg-sv-red hover:bg-sv-red/80 text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
        >
          Fechar loja
        </button>
      </div>
    </div>
  );
}
