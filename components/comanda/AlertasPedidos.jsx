'use client';

import { useEffect, useRef, useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { STATUS_LABEL, TIPO_LABEL } from '@/lib/comanda/constantes';
import { destravarAudio, iniciarSirene, pararSirene } from '@/lib/comanda/som';

let proximoId = 1;

export default function AlertasPedidos({ cargo }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [alertas, setAlertas] = useState([]);
  const audioDestravadoRef = useRef(false);
  const alertasRef = useRef([]);

  useEffect(() => {
    alertasRef.current = alertas;
  }, [alertas]);

  // Som só pode tocar depois de uma interação do usuário na página. Se já
  // houver alertas pendentes nesse momento, a sirene começa assim que destrava.
  useEffect(() => {
    function destravar() {
      destravarAudio();
      audioDestravadoRef.current = true;
      if (alertasRef.current.length > 0) iniciarSirene();
    }
    window.addEventListener('pointerdown', destravar, { once: true });
    window.addEventListener('keydown', destravar, { once: true });
    return () => {
      window.removeEventListener('pointerdown', destravar);
      window.removeEventListener('keydown', destravar);
    };
  }, []);

  function adicionarAlerta(mensagem) {
    setAlertas((atual) => [...atual, { id: proximoId++, mensagem }]);
    if (audioDestravadoRef.current) iniciarSirene();
  }

  function confirmarAlertas() {
    setAlertas([]);
    pararSirene();
  }

  useEffect(() => {
    let canal;
    let ativo = true;

    async function conectar() {
      // Aguarda a sessão antes de abrir o canal, senão o RLS descarta os
      // primeiros eventos (mesma corrida documentada no painel da cozinha).
      await supabase.auth.getSession();
      if (!ativo) return;

      canal = supabase
        .channel('alertas-pedidos')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
          // Pedido novo é o garçom avisando — só interessa à cozinha.
          if (cargo !== 'cozinha') return;
          const tipoLabel = TIPO_LABEL[payload.new.tipo] ?? payload.new.tipo;
          adicionarAlerta(`Novo pedido #${payload.new.numero} — ${tipoLabel}`);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, (payload) => {
          // Mudança de status é a cozinha avisando — só interessa ao garçom.
          if (cargo !== 'garcom') return;
          if (payload.old.status === payload.new.status) return;
          const statusLabel = STATUS_LABEL[payload.new.status] ?? payload.new.status;
          adicionarAlerta(`Pedido #${payload.new.numero} → ${statusLabel}`);
        })
        .subscribe();
    }

    conectar();

    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
      pararSirene();
    };
  }, [supabase, cargo]);

  if (alertas.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70">
      <div className="toast-pedido bg-sv-dark text-white rounded-3xl shadow-2xl border-2 border-sv-red max-w-md w-full p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {alertas.map((alerta) => (
            <p key={alerta.id} className="font-black text-lg md:text-xl uppercase tracking-wide text-center">
              {alerta.mensagem}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={confirmarAlertas}
          className="bg-sv-red hover:bg-sv-blue text-white font-black py-4 rounded-xl uppercase tracking-wider text-sm transition-colors duration-150"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
