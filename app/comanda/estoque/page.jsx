import PainelEstoque from "@/components/comanda/PainelEstoque";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function EstoquePage() {
  const supabase = await criarClienteServidor();
  const { data: insumos } = await supabase
    .from("insumos")
    .select("*")
    .order("nome", { ascending: true });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Estoque
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Insumos, entradas e ajustes. A baixa por venda acontece sozinha, seguindo a ficha técnica de cada produto/adicional.
        </p>
      </div>

      <PainelEstoque insumosIniciais={insumos ?? []} />
    </section>
  );
}
