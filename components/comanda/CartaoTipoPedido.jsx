import Link from 'next/link';

const CORES = {
  mesa: 'hover:border-sv-blue',
  delivery: 'hover:border-sv-red',
  pdv: 'hover:border-sv-dark',
};

export default function CartaoTipoPedido({ tipo, titulo, descricao, emoji, contador }) {
  return (
    <Link
      href={`/comanda/novo/${tipo}`}
      className={`bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col gap-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${CORES[tipo] ?? ''}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{emoji}</span>
        {typeof contador === 'number' && contador > 0 && (
          <span className="bg-sv-red text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            {contador} aberto{contador === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-black text-sv-dark uppercase tracking-tight">{titulo}</h3>
        <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed">{descricao}</p>
      </div>
      <span className="mt-2 text-xs font-black text-sv-blue uppercase tracking-wider">
        Novo pedido →
      </span>
    </Link>
  );
}
