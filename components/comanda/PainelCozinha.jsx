'use client';

import { useEffect, useRef, useState } from 'react';
import CardPedidoCozinha from '@/components/comanda/CardPedidoCozinha';
import EstadoVazio from '@/components/comanda/EstadoVazio';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { atualizarPagamentoPedido, atualizarStatusPedido, buscarPedidoPorId } from '@/lib/comanda/pedidos';
import { tocarAvisoTempo } from '@/lib/comanda/som';
import { minutosDecorridos } from '@/lib/comanda/formato';

const COLUNAS = [
  { status: 'recebido', titulo: 'Recebido' },
  { status: 'preparando', titulo: 'Preparando' },
  { status: 'pronto', titulo: 'Pronto' },
];

const INTERVALO_AVISO_MIN = 15;

export default function PainelCozinha({ pedidosIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [conectado, setConectado] = useState(false);
  const [, forcarAtualizacaoRelogio] = useState(0);

  const pedidosRef = useRef(pedidos);
  useEffect(() => {
    pedidosRef.current = pedidos;
  }, [pedidos]);

  // Maior múltiplo de 15min já avisado por pedido — evita repetir o aviso
  // a cada tick, só toca de novo quando cruza o próximo múltiplo.
  const avisadosRef = useRef({});

  useEffect(() => {
    const intervalo = setInterval(() => {
      let precisaAvisar = false;

      for (const pedido of pedidosRef.current) {
        if (pedido.status === 'entregue' || pedido.status === 'cancelado') continue;

        const minutos = minutosDecorridos(pedido.created_at);
        const marco = Math.floor(minutos / INTERVALO_AVISO_MIN) * INTERVALO_AVISO_MIN;

        if (marco >= INTERVALO_AVISO_MIN && (avisadosRef.current[pedido.id] ?? 0) < marco) {
          avisadosRef.current[pedido.id] = marco;
          precisaAvisar = true;
        }
      }

      if (precisaAvisar) tocarAvisoTempo();
      // Força atualizar o "há X min" na tela mesmo sem evento novo do realtime.
      forcarAtualizacaoRelogio((n) => n + 1);
    }, 20000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    let canal;
    let ativo = true;

    async function conectar() {
      // Necessário aguardar a sessão antes de abrir o canal, senão o RLS
      // descarta os primeiros eventos por a sessão ainda não estar anexada.
      await supabase.auth.getSession();
      if (!ativo) return;

      canal = supabase
        .channel('pedidos-cozinha')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, async (payload) => {
          const pedidoCompleto = await buscarPedidoPorId(supabase, payload.new.id);
          setPedidos((atual) => {
            if (atual.some((p) => p.id === pedidoCompleto.id)) return atual;
            return [...atual, pedidoCompleto];
          });
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, (payload) => {
          setPedidos((atual) => atual.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p)));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pedidos' }, (payload) => {
          setPedidos((atual) => atual.filter((p) => p.id !== payload.old.id));
        })
        .subscribe((status) => setConectado(status === 'SUBSCRIBED'));
    }

    conectar();

    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
    };
  }, [supabase]);

  async function avancarStatus(pedidoId, novoStatus) {
    setPedidos((atual) => atual.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p)));
    try {
      await atualizarStatusPedido(supabase, pedidoId, novoStatus);
    } catch (err) {
      console.error(err);
    }
  }

  async function cancelarPedido(pedidoId) {
    setPedidos((atual) => atual.map((p) => (p.id === pedidoId ? { ...p, status: 'cancelado' } : p)));
    try {
      await atualizarStatusPedido(supabase, pedidoId, 'cancelado');
    } catch (err) {
      console.error(err);
    }
  }

  async function togglePago(pedidoId, pago) {
    setPedidos((atual) => atual.map((p) => (p.id === pedidoId ? { ...p, pago } : p)));
    try {
      await atualizarPagamentoPedido(supabase, pedidoId, pago);
    } catch (err) {
      console.error(err);
    }
  }

  const pedidosAtivos = pedidos.filter((p) => p.status !== 'entregue' && p.status !== 'cancelado');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-gray-300'}`} />
        {conectado ? 'Ao vivo' : 'Conectando...'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUNAS.map((coluna) => {
          const itensColuna = pedidosAtivos
            .filter((p) => p.status === coluna.status)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

          return (
            <div key={coluna.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-sv-dark uppercase tracking-wider text-sm">{coluna.titulo}</h3>
                <span className="text-xs font-bold text-gray-400">{itensColuna.length}</span>
              </div>

              <div className="flex flex-col gap-3 min-h-[120px]">
                {itensColuna.length === 0 && <EstadoVazio mensagem="Nenhum pedido aqui." />}
                {itensColuna.map((pedido) => (
                  <CardPedidoCozinha
                    key={pedido.id}
                    pedido={pedido}
                    onAvancar={avancarStatus}
                    onCancelar={cancelarPedido}
                    onTogglePago={togglePago}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
