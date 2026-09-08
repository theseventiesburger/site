import { formatarBRL, formatarDataHora } from '@/lib/comanda/formato';
import { RESTAURANTE } from '@/lib/comanda/constantes';

// Cupom de 80mm pra impressora térmica — só aparece no papel (`print:block`
// / `hidden` na tela). Fica escondido dentro do próprio FecharContaModal,
// como um irmão fora do overlay (que leva `print:hidden`), assim
// `window.print()` imprime só isto.
// De propósito enxuto: só o que o cliente confere na mesa (itens + total),
// sem detalhamento de subtotal/taxa/desconto, forma de pagamento nem
// endereço/telefone — esse cupom não é a nota fiscal, é o resumo pra
// conferência antes de pagar.
export default function ReciboFechamento({ mesaNumero, linhas, total }) {
  return (
    <div className="hidden print:block w-[80mm] mx-auto p-2 text-black font-mono text-[11px] leading-snug">
      <div className="text-center mb-1">
        <p className="font-black text-sm uppercase">{RESTAURANTE.nome}</p>
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

      <div className="flex justify-between font-black text-sm">
        <span>TOTAL</span>
        <span>{formatarBRL(total)}</span>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <p className="text-center">Obrigado pela preferência!</p>
    </div>
  );
}
