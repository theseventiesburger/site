'use client';

import { useEffect, useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';

function base64ParaUint8Array(base64) {
  const preenchimento = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Seguro = (base64 + preenchimento).replace(/-/g, '+').replace(/_/g, '/');
  const bruto = atob(base64Seguro);
  return Uint8Array.from([...bruto].map((c) => c.charCodeAt(0)));
}

export default function NotificacoesPush({ userId }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [status, setStatus] = useState('verificando');

  useEffect(() => {
    async function verificar() {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('indisponivel');
        return;
      }

      try {
        const registro = await navigator.serviceWorker.register('/sw.js');
        const inscricaoExistente = await registro.pushManager.getSubscription();

        if (inscricaoExistente) {
          setStatus('ativado');
        } else if (Notification.permission === 'denied') {
          setStatus('negado');
        } else {
          setStatus('disponivel');
        }
      } catch {
        setStatus('indisponivel');
      }
    }

    verificar();
  }, []);

  async function ativar() {
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') {
      setStatus('negado');
      return;
    }

    try {
      const registro = await navigator.serviceWorker.ready;
      const inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ParaUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      const json = inscricao.toJSON();

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth_key: json.keys.auth,
        },
        { onConflict: 'endpoint' }
      );

      if (error) throw error;
      setStatus('ativado');
    } catch (err) {
      console.error(err);
      setStatus('disponivel');
    }
  }

  if (status === 'ativado') {
    return <span className="text-[10px] text-green-400 font-black uppercase tracking-wider">🔔 Notificações ativas</span>;
  }

  if (status === 'disponivel') {
    return (
      <button
        type="button"
        onClick={ativar}
        className="text-[10px] font-black uppercase tracking-wider text-gray-300 hover:text-white underline underline-offset-2"
      >
        🔔 Ativar notificações
      </button>
    );
  }

  return null;
}
