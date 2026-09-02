import PainelBairros from "@/components/comanda/PainelBairros";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function BairrosPage() {
  const supabase = await criarClienteServidor();
  const { data: bairros } = await supabase
    .from("bairros")
    .select("*")
    .order("nome", { ascending: true });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Bairros
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Valor do frete por bairro, usado no cálculo automático do delivery.
        </p>
      </div>

      <PainelBairros bairrosIniciais={bairros ?? []} />
    </section>
  );
}
