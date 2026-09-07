import { formatarBRL, formatarDataHora } from '@/lib/comanda/formato';
import { FORMA_PAGAMENTO_LABEL, RESTAURANTE } from '@/lib/comanda/constantes';

// Cupom de 80mm pra impressora térmica — só aparece no papel (`print:block`
// / `hidden` na tela). Fica escondido dentro do próprio FecharContaModal,
// como um irmão fora do overlay (que leva `print:hidden`), assim
// `window.print()` imprime só isto.
export default function ReciboFechamento({ mesaNumero, linhas, subtotal, taxaServico, desconto, total, formaPagamento }) {
  return (
    <div className="hidden print:block w-[80mm] mx-auto p-2 text-black font-mono text-[11px] leading-snug">
      <div className="text-center mb-1">
        <p className="font-black text-sm uppercase">{RESTAURANTE.nome}</p>
        <p>{RESTAURANTE.endereco}</p>
        <p>{RESTAURANTE.telefone}</p>
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between">
        <span>Mesa {mesaNumero}</span>
        <span>{formatarDataHora(new Date().toISOString())}</span>
      </div>

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
      {taxaServico > 0 && (
        <div className="flex justify-between">
          <span>Taxa de serviço</span>
          <span>{formatarBRL(taxaServico)}</span>
        </div>
      )}
      {desconto > 0 && (
        <div className="flex justify-between">
          <span>Desconto</span>
          <span>-{formatarBRL(desconto)}</span>
        </div>
      )}

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between font-black text-sm">
        <span>TOTAL</span>
        <span>{formatarBRL(total)}</span>
      </div>

      <div className="flex justify-between mt-1">
        <span>Pagamento</span>
        <span>{formaPagamento ? (FORMA_PAGAMENTO_LABEL[formaPagamento] ?? formaPagamento) : 'A definir'}</span>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <p className="text-center">Obrigado pela preferência!</p>
    </div>
  );
}
