import { formatarBRL, formatarDataHora } from '@/lib/comanda/formato';
import { RESTAURANTE, TIPO_LABEL } from '@/lib/comanda/constantes';

// Cupom de 80mm pra pedido avulso (delivery/pdv/retirada) — mesmo padrão do
// ReciboFechamento (mesa), só que sem rodada nem taxa de serviço. Fica
// escondido dentro do próprio FecharPedidoModal, como um irmão fora do
// overlay (que leva `print:hidden`), assim `window.print()` imprime só isto.
export default function ReciboPedidoAvulso({ pedido, linhas, subtotal, taxaEntrega, desconto, total }) {
  return (
    <div className="hidden print:block w-[80mm] mx-auto p-2 text-black font-mono text-sm leading-snug">
      <div className="text-center mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- print-only,
            next/image não faz sentido aqui (sem otimização/lazy-load na hora
            de imprimir) */}
        <img src="/logo.png" alt={RESTAURANTE.nome} className="w-[26mm] h-[26mm] object-contain mx-auto" />
        <p className="font-black text-lg uppercase">{RESTAURANTE.nome}</p>
        <p className="text-xs">{RESTAURANTE.endereco}</p>
        <p className="text-xs">CNPJ {RESTAURANTE.cnpj}</p>
        <p className="text-xs">{RESTAURANTE.telefone}</p>
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between">
        <span>{TIPO_LABEL[pedido.tipo] ?? pedido.tipo} #{pedido.numero}</span>
        <span>{formatarDataHora(new Date().toISOString())}</span>
      </div>
      {pedido.cliente_nome && <p>{pedido.cliente_nome}</p>}

      <div className="border-t border-dashed border-black my-1" />

      {linhas.map((linha, i) => (
        <div key={i} className="flex justify-between gap-2">
          <span className="flex-1 min-w-0">
            {linha.quantidade}x {linha.nome}
            {linha.cortesia ? ' (cortesia)' : ''}
          </span>
          <span className="flex-shrink-0">{formatarBRL(linha.valor)}</span>
        </div>
      ))}

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatarBRL(subtotal)}</span>
      </div>
      {taxaEntrega > 0 && (
        <div className="flex justify-between">
          <span>Taxa de entrega</span>
          <span>{formatarBRL(taxaEntrega)}</span>
        </div>
      )}
      {desconto > 0 && (
        <div className="flex justify-between">
          <span>Desconto</span>
          <span>-{formatarBRL(desconto)}</span>
        </div>
      )}

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between font-black text-lg">
        <span>TOTAL</span>
        <span>{formatarBRL(total)}</span>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <p className="text-center">Obrigado pela preferência!</p>
    </div>
  );
}
