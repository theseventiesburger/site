import { STATUS_COR, STATUS_LABEL } from '@/lib/comanda/constantes';

export default function BadgeStatus({ status }) {
  return (
    <span
      className={`inline-block text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_COR[status] ?? 'bg-gray-400'}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
