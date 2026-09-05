import PainelMesas from "@/components/comanda/PainelMesas";
import { listarMesasComComandas } from "@/lib/comanda/comandas";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function MesasPage() {
  const supabase = await criarClienteServidor();
  const mesas = await listarMesasComComandas(supabase);

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Mesas
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-2">
          Toque numa mesa livre pra abrir, ou numa ocupada pra ver a conta e lançar mais itens.
        </p>
      </div>

      <PainelMesas mesasIniciais={mesas} />
    </section>
  );
}
