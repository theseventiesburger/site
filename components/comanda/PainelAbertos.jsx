'use client';

import { useEffect, useState } from 'react';
import CardComandaAberta from '@/components/comanda/CardComandaAberta';
import CardPedidoAberto from '@/components/comanda/CardPedidoAberto';
import EstadoVazio from '@/components/comanda/EstadoVazio';
import FecharContaModal from '@/components/comanda/FecharContaModal';
import FecharPedidoModal from '@/components/comanda/FecharPedidoModal';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { buscarComandaPorId, fecharComanda } from '@/lib/comanda/comandas';
import { buscarPedidoPorId, fecharPedido } from '@/lib/comanda/pedidos';

export default function PainelAbertos({ pedidosIniciais, comandasIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [comandas, setComandas] = useState(comandasIniciais);
  const [conectado, setConectado] = useState(false);
  const [pedidoFechando, setPedidoFechando] = useState(null);
  const [comandaFechando, setComandaFechando] = useState(null);

  useEffect(() => {
    let canalPedidos;
    let canalComandas;
    let ativo = true;

    async function conectar() {
      // Necessário aguardar a sessão antes de abrir o canal, senão o RLS
      // descarta os primeiros eventos por a sessão ainda não estar anexada.
      await supabase.auth.getSession();
      if (!ativo) return;

      canalPedidos = supabase
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

      // Qualquer mudança em `comandas` cobre tanto abrir/fechar mesa quanto
      // itens mudando (o total é recalculado ali por trigger a cada troca em
      // itens_pedido) — mais simples reconsultar a comanda inteira do que
      // tentar remendar item por item no estado local.
      canalComandas = supabase
        .channel('comandas-abertas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comandas' }, async (payload) => {
          const id = payload.new?.id ?? payload.old?.id;
          if (payload.eventType === 'DELETE' || payload.new?.status !== 'aberta') {
            setComandas((atual) => atual.filter((c) => c.id !== id));
            return;
          }
          const comandaCompleta = await buscarComandaPorId(supabase, id);
          if (!comandaCompleta) return;
          setComandas((atual) => [...atual.filter((c) => c.id !== comandaCompleta.id), comandaCompleta]);
        })
        .subscribe();
    }

    conectar();

    return () => {
      ativo = false;
      if (canalPedidos) supabase.removeChannel(canalPedidos);
      if (canalComandas) supabase.removeChannel(canalComandas);
    };
  }, [supabase]);

  async function confirmarFechamentoPedido(pedidoId, payload) {
    await fecharPedido(supabase, pedidoId, payload);
    setPedidoFechando(null);
    setPedidos((atual) => atual.filter((p) => p.id !== pedidoId));
  }

  async function confirmarFechamentoComanda(comandaId, payload) {
    await fecharComanda(supabase, comandaId, payload);
    setComandaFechando(null);
    setComandas((atual) => atual.filter((c) => c.id !== comandaId));
  }

  const vazio = pedidos.length === 0 && comandas.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-gray-300'}`} />
        {conectado ? 'Ao vivo' : 'Conectando...'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vazio && <EstadoVazio mensagem="Nenhuma mesa aberta nem pedido aguardando pagamento." />}
        {comandas.map((comanda) => (
          <CardComandaAberta key={comanda.id} comanda={comanda} onFecharConta={setComandaFechando} />
        ))}
        {pedidos.map((pedido) => (
          <CardPedidoAberto key={pedido.id} pedido={pedido} onFecharPedido={setPedidoFechando} />
        ))}
      </div>

      {pedidoFechando && (
        <FecharPedidoModal
          pedido={pedidoFechando}
          onFechar={() => setPedidoFechando(null)}
          onConfirmar={confirmarFechamentoPedido}
        />
      )}

      {comandaFechando && (
        <FecharContaModal
          comanda={comandaFechando}
          onFechar={() => setComandaFechando(null)}
          onConfirmar={confirmarFechamentoComanda}
        />
      )}
    </div>
  );
}
