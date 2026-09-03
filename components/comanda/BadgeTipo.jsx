import { TIPO_LABEL } from '@/lib/comanda/constantes';

const CORES = {
  mesa: 'bg-sv-blue/10 text-sv-blue',
  delivery: 'bg-sv-red/10 text-sv-red',
  pdv: 'bg-sv-dark/10 text-sv-dark',
  retirada: 'bg-amber-500/10 text-amber-600',
};

export default function BadgeTipo({ tipo }) {
  return (
    <span
      className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${CORES[tipo] ?? 'bg-gray-100 text-gray-500'}`}
    >
      {TIPO_LABEL[tipo] ?? tipo}
    </span>
  );
}
