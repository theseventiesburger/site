import BadgeStatus from '@/components/comanda/BadgeStatus';
import BadgeTipo from '@/components/comanda/BadgeTipo';
import { PROXIMO_STATUS, STATUS_LABEL, PONTO_CARNE_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, formatarHora, tempoDecorrido, minutosDecorridos } from '@/lib/comanda/formato';

export default function CardPedidoCozinha({ pedido, onAvancar, onCancelar, onTogglePago }) {
  const proximoStatus = PROXIMO_STATUS[pedido.status];
  const itens = pedido.itens_pedido ?? [];
  // Na mesa, o garçom reconhece o pedido pelo número da mesa mais rápido
  // que pelo número do pedido — então é a mesa que fica em destaque.
  const destaque = pedido.tipo === 'mesa' ? `Mesa ${pedido.mesa_id}` : `#${pedido.numero}`;
  const minutosPassados = minutosDecorridos(pedido.created_at);

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border p-5 flex flex-col gap-3 ${
        minutosPassados >= 30 ? 'border-sv-red' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-sv-dark text-lg">{destaque}</p>
          <div className="flex items-center gap-2 mt-1">
            <BadgeTipo tipo={pedido.tipo} />
            <BadgeStatus status={pedido.status} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] text-gray-400 font-bold">{formatarHora(pedido.created_at)}</p>
          <p
            className={`text-[11px] font-medium ${
              minutosPassados >= 30 ? 'text-sv-red font-black' : minutosPassados >= 15 ? 'text-amber-600 font-bold' : 'text-gray-400'
            }`}
          >
            {minutosPassados >= 15 ? '⏰ ' : ''}há {tempoDecorrido(pedido.created_at)}
          </p>
        </div>
      </div>

      <div className="text-sm font-bold text-sv-dark">
        {pedido.tipo === 'mesa' && `Pedido #${pedido.numero}`}
        {pedido.tipo === 'delivery' && (pedido.cliente_nome || 'Cliente sem nome')}
        {pedido.tipo === 'pdv' && (pedido.cliente_nome || 'Balcão')}
        {pedido.tipo === 'retirada' && (pedido.cliente_nome || 'Cliente sem nome')}
      </div>
      {pedido.tipo === 'retirada' && pedido.cliente_telefone && (
        <p className="text-xs text-gray-500 font-medium -mt-2">{pedido.cliente_telefone}</p>
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
            {item.observacao && (
              <span className="block text-gray-400 font-medium pl-4">— {item.observacao}</span>
            )}
          </li>
        ))}
      </ul>

      {pedido.observacoes && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
          {pedido.observacoes}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
        <span className="font-black text-sv-dark">{formatarBRL(pedido.total)}</span>

        {pedido.tipo !== 'mesa' && (
          <button
            type="button"
            onClick={() => onTogglePago(pedido.id, !pedido.pago)}
            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors duration-150 ${
              pedido.pago ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {pedido.pago ? 'Pago' : 'Marcar pago'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {proximoStatus && (
          <button
            type="button"
            onClick={() => onAvancar(pedido.id, proximoStatus)}
            className="flex-1 font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-all duration-150 bg-sv-dark text-white hover:bg-sv-blue"
          >
            {STATUS_LABEL[proximoStatus]}
          </button>
        )}
        {pedido.status !== 'cancelado' && pedido.status !== 'entregue' && (
          <button
            type="button"
            onClick={() => onCancelar(pedido.id)}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-400 hover:text-sv-red hover:border-sv-red font-black text-xs uppercase transition-colors duration-150"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
