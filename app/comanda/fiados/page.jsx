import PainelFiados from "@/components/comanda/PainelFiados";
import { listarFiados } from "@/lib/comanda/fiados";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function FiadosPage() {
  const supabase = await criarClienteServidor();
  const pedidos = await listarFiados(supabase);

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Fiados
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-2">
          Vendas a prazo, separadas de Pedidos Abertos pra não atrapalhar o fechamento do caixa.
        </p>
      </div>

      <PainelFiados pedidosIniciais={pedidos} />
    </section>
  );
}
