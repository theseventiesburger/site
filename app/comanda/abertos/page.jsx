import PainelAbertos from "@/components/comanda/PainelAbertos";
import { listarComandasAbertas } from "@/lib/comanda/comandas";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function PedidosAbertosPage() {
  const supabase = await criarClienteServidor();
  const [{ data: pedidos }, comandas] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, itens_pedido(*, itens_pedido_adicionais(*))")
      .eq("status", "entregue")
      .eq("pago", false)
      .neq("tipo", "mesa")
      .order("created_at", { ascending: true }),
    listarComandasAbertas(supabase),
  ]);

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8 print:hidden">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Pedidos Abertos
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-2">
          Mesas abertas e pedidos que já saíram da cozinha mas ainda esperam a confirmação do pagamento.
        </p>
      </div>

      <PainelAbertos pedidosIniciais={pedidos ?? []} comandasIniciais={comandas} />
    </section>
  );
}
