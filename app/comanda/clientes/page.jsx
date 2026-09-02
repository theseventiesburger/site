import PainelClientes from "@/components/comanda/PainelClientes";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function ClientesPage() {
  const supabase = await criarClienteServidor();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*, pedidos(count)")
    .order("nome", { ascending: true });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Clientes
        </h1>
      </div>

      <PainelClientes clientesIniciais={clientes ?? []} />
    </section>
  );
}
