'use client';

export default function BotaoImprimir({ label = 'Imprimir' }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden fixed bottom-6 right-6 z-50 bg-sv-blue hover:bg-sv-red text-white font-black px-6 py-3.5 rounded-full shadow-2xl uppercase tracking-wider text-xs transition-colors duration-150"
    >
      🖨️ {label}
    </button>
  );
}
