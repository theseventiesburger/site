import BadgeTipo from '@/components/comanda/BadgeTipo';
import { PONTO_CARNE_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, tempoDecorrido } from '@/lib/comanda/formato';

// Mesa aberta na tela de Pedidos Abertos — mesmos dados de PainelMesa, só
// que resumidos (aqui é só pra decidir se fecha a conta, não pra lançar
// itens novos).
export default function CardComandaAberta({ comanda, onFecharConta }) {
  const itens = (comanda.pedidos ?? []).flatMap((pedido) =>
    (pedido.itens_pedido ?? []).filter((item) => item.status !== 'cancelado')
  );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-sv-dark text-lg">Mesa {comanda.mesa_id}</p>
          <BadgeTipo tipo="mesa" />
        </div>
        <p className="text-[11px] text-gray-400 font-medium text-right">
          aberta há {tempoDecorrido(comanda.aberta_em)}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
        {itens.length === 0 && <li className="text-xs text-gray-400 font-medium">Nenhum item lançado ainda.</li>}
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
        <span className="font-black text-sv-dark text-lg">{formatarBRL(comanda.total)}</span>
        <button
          type="button"
          onClick={() => onFecharConta(comanda)}
          className="bg-sv-dark text-white font-black px-4 py-2 rounded-xl uppercase tracking-wider text-[11px] hover:bg-sv-blue transition-colors duration-150"
        >
          Fechar conta
        </button>
      </div>
    </div>
  );
}
