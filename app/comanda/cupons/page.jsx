import PainelCupons from "@/components/comanda/PainelCupons";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function CuponsPage() {
  const supabase = await criarClienteServidor();
  const { data: cupons } = await supabase
    .from("cupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Cupons
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Cupons de desconto para pedidos diretos e para a vitrine do site.
        </p>
      </div>

      <PainelCupons cuponsIniciais={cupons ?? []} />
    </section>
  );
}
