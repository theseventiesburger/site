import BadgeTipo from '@/components/comanda/BadgeTipo';
import { PONTO_CARNE_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, formatarDataHora, tempoDecorrido } from '@/lib/comanda/formato';

export default function CardPedidoAberto({ pedido, onFecharPedido }) {
  const itens = pedido.itens_pedido ?? [];
  const destaque = pedido.tipo === 'mesa' ? `Mesa ${pedido.mesa_id}` : `#${pedido.numero}`;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-sv-dark text-lg">{destaque}</p>
          <div className="flex items-center gap-2 mt-1">
            <BadgeTipo tipo={pedido.tipo} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] text-gray-400 font-bold">{formatarDataHora(pedido.created_at)}</p>
          <p className="text-[11px] text-gray-400 font-medium">entregue há {tempoDecorrido(pedido.created_at)}</p>
        </div>
      </div>

      <div className="text-sm font-bold text-sv-dark">
        {pedido.tipo === 'mesa' && `Pedido #${pedido.numero}`}
        {pedido.tipo === 'delivery' && (pedido.cliente_nome || 'Cliente sem nome')}
        {pedido.tipo === 'pdv' && (pedido.cliente_nome || 'Balcão')}
        {pedido.tipo === 'retirada' && (pedido.cliente_nome || 'Cliente sem nome')}
      </div>
      {pedido.tipo === 'retirada' && pedido.cliente_telefone && (
        <p className="text-xs text-gray-500 font-medium">{pedido.cliente_telefone}</p>
      )}

      {pedido.tipo === 'delivery' && pedido.endereco && (
        <p className="text-xs text-gray-500 font-medium leading-relaxed">{pedido.endereco}</p>
      )}

      <ul className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
        {itens.map((item) => (
          <li key={item.id} className="text-xs">
            <span className="font-black text-sv-dark">{item.quantidade}x</span>{' '}
            <span className="text-sv-dark font-medium">{item.nome_produto}</span>
            {item.ponto_carne && (
              <span className="block text-sv-red font-black pl-4 uppercase tracking-wide">
                🔥 {PONTO_CARNE_LABEL[item.ponto_carne] ?? item.ponto_carne}
              </span>
            )}
            {(item.itens_pedido_adicionais ?? []).map((adicional) => (
              <span key={adicional.id} className="block text-sv-blue font-bold pl-4">
                + {adicional.nome_adicional}
              </span>
            ))}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
        <span className="font-black text-sv-dark text-lg">{formatarBRL(pedido.total)}</span>
        <button
          type="button"
          onClick={() => onFecharPedido(pedido)}
          className="bg-sv-dark text-white font-black px-4 py-2 rounded-xl uppercase tracking-wider text-[11px] hover:bg-sv-blue transition-colors duration-150"
        >
          Fechar pedido
        </button>
      </div>
    </div>
  );
}
