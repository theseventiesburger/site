import PainelLojaUairango from "@/components/comanda/PainelLojaUairango";

export default function UairangoLojaPage() {
  return (
    <section className="w-full max-w-2xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Loja no UaiRango
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Abre/fecha o recebimento de pedidos pela plataforma — delivery e retirada juntos.
        </p>
      </div>

      <PainelLojaUairango />
    </section>
  );
}
