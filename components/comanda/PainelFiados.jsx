'use client';

import { useEffect, useState } from 'react';
import CardFiado from '@/components/comanda/CardFiado';
import EstadoVazio from '@/components/comanda/EstadoVazio';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarFiados, agruparFiados } from '@/lib/comanda/fiados';
import { confirmarRecebimentoPedido } from '@/lib/comanda/pedidos';
import { formatarBRL } from '@/lib/comanda/formato';

export default function PainelFiados({ pedidosIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [conectado, setConectado] = useState(false);

  async function recarregar() {
    try {
      const atualizados = await listarFiados(supabase);
      setPedidos(atualizados);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    let canal;
    let ativo = true;

    async function conectar() {
      await supabase.auth.getSession();
      if (!ativo) return;

      // Conjunto pequeno e a regra de agrupar por comanda muda conforme o
      // pedido que mexeu — mais simples reconsultar tudo do que remendar
      // estado local item por item.
      canal = supabase
        .channel('fiados')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
          if (ativo) recarregar();
        })
        .subscribe((status) => setConectado(status === 'SUBSCRIBED'));
    }

    conectar();

    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function confirmar(pedido, formaPagamento) {
    await confirmarRecebimentoPedido(supabase, pedido, formaPagamento);
    await recarregar();
  }

  const grupos = agruparFiados(pedidos);
  const totalGeral = grupos.reduce((soma, g) => soma + g.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-gray-300'}`} />
          {conectado ? 'Ao vivo' : 'Conectando...'}
        </div>
        {grupos.length > 0 && (
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
            Total em aberto: <span className="text-sv-dark">{formatarBRL(totalGeral)}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grupos.length === 0 && <EstadoVazio mensagem="Nenhum fiado em aberto." />}
        {grupos.map((grupo) => (
          <CardFiado key={grupo.chave} grupo={grupo} onConfirmar={confirmar} />
        ))}
      </div>
    </div>
  );
}
