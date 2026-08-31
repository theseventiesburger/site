'use client';

import { useEffect, useRef, useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { STATUS_LABEL, TIPO_LABEL } from '@/lib/comanda/constantes';
import { destravarAudio, tocarBeep } from '@/lib/comanda/som';

let proximoId = 1;

export default function AlertasPedidos() {
  const [supabase] = useState(() => criarClienteBrowser());
  const [toasts, setToasts] = useState([]);
  const audioDestravadoRef = useRef(false);

  // Som só pode tocar depois de uma interação do usuário na página.
  useEffect(() => {
    function destravar() {
      destravarAudio();
      audioDestravadoRef.current = true;
    }
    window.addEventListener('pointerdown', destravar, { once: true });
    window.addEventListener('keydown', destravar, { once: true });
    return () => {
      window.removeEventListener('pointerdown', destravar);
      window.removeEventListener('keydown', destravar);
    };
  }, []);

  function mostrarToast(mensagem) {
    const id = proximoId++;
    setToasts((atual) => [...atual, { id, mensagem }]);
    if (audioDestravadoRef.current) tocarBeep();
    setTimeout(() => {
      setToasts((atual) => atual.filter((t) => t.id !== id));
    }, 5000);
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
          const tipoLabel = TIPO_LABEL[payload.new.tipo] ?? payload.new.tipo;
          mostrarToast(`Novo pedido #${payload.new.numero} — ${tipoLabel}`);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, (payload) => {
          if (payload.old.status === payload.new.status) return;
          const statusLabel = STATUS_LABEL[payload.new.status] ?? payload.new.status;
          mostrarToast(`Pedido #${payload.new.numero} → ${statusLabel}`);
        })
        .subscribe();
    }

    conectar();

    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
    };
  }, [supabase]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-pedido pointer-events-auto bg-sv-dark text-white font-bold text-sm px-4 py-3 rounded-xl shadow-2xl border border-white/10"
        >
          {toast.mensagem}
        </div>
      ))}
    </div>
  );
}
