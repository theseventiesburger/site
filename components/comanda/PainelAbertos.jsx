'use client';

import { useEffect, useState } from 'react';
import CardPedidoAberto from '@/components/comanda/CardPedidoAberto';
import EstadoVazio from '@/components/comanda/EstadoVazio';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { buscarPedidoPorId, definirPagamentoPedido } from '@/lib/comanda/pedidos';

export default function PainelAbertos({ pedidosIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [conectado, setConectado] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let canal;
    let ativo = true;

    async function conectar() {
      // Necessário aguardar a sessão antes de abrir o canal, senão o RLS
      // descarta os primeiros eventos por a sessão ainda não estar anexada.
      await supabase.auth.getSession();
      if (!ativo) return;

      canal = supabase
        .channel('pedidos-abertos')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, async (payload) => {
          const entrouAberto = payload.new.status === 'entregue' && !payload.new.pago && payload.new.tipo !== 'mesa';
          if (entrouAberto) {
            const pedidoCompleto = await buscarPedidoPorId(supabase, payload.new.id);
            setPedidos((atual) =>
              atual.some((p) => p.id === pedidoCompleto.id) ? atual : [...atual, pedidoCompleto]
            );
          } else {
            setPedidos((atual) => atual.filter((p) => p.id !== payload.new.id));
          }
        })
        .subscribe((status) => setConectado(status === 'SUBSCRIBED'));
    }

    conectar();

    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
    };
  }, [supabase]);

  async function confirmarPagamento(pedidoId, formaPagamento) {
    const pedidoRemovido = pedidos.find((p) => p.id === pedidoId);
    setPedidos((atual) => atual.filter((p) => p.id !== pedidoId));
    try {
      await definirPagamentoPedido(supabase, pedidoId, formaPagamento);
    } catch (err) {
      console.error(err);
      // Sem isso, um erro deixava o pedido sumir da lista sem o pagamento
      // ter sido confirmado de verdade no banco.
      if (pedidoRemovido) {
        setPedidos((atual) => (atual.some((p) => p.id === pedidoId) ? atual : [...atual, pedidoRemovido]));
      }
      setErro('Não foi possível confirmar o pagamento. Tente de novo.');
      setTimeout(() => setErro(null), 5000);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-gray-300'}`} />
        {conectado ? 'Ao vivo' : 'Conectando...'}
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          ⚠ {erro}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pedidos.length === 0 && <EstadoVazio mensagem="Nenhum pedido aguardando pagamento." />}
        {pedidos.map((pedido) => (
          <CardPedidoAberto key={pedido.id} pedido={pedido} onConfirmarPagamento={confirmarPagamento} />
        ))}
      </div>
    </div>
  );
}
