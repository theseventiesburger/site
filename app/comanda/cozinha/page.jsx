import PainelCozinha from "@/components/comanda/PainelCozinha";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function CozinhaPage() {
  const supabase = await criarClienteServidor();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, itens_pedido(*)")
    .not("status", "in", "(entregue,cancelado)")
    .order("created_at", { ascending: true });

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Cozinha
        </h1>
      </div>

      <PainelCozinha pedidosIniciais={pedidos ?? []} />
    </section>
  );
}
