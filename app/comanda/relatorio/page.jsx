import PainelRelatorio from "@/components/comanda/PainelRelatorio";
import { criarClienteServidor } from "@/lib/supabase/server";
import { dataHojeSP } from "@/lib/comanda/formato";

export default async function RelatorioPage() {
  const supabase = await criarClienteServidor();
  const hoje = dataHojeSP();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, itens_pedido(*, itens_pedido_adicionais(*))")
    .gte("created_at", `${hoje}T00:00:00-03:00`)
    .lte("created_at", `${hoje}T23:59:59.999-03:00`)
    .order("created_at", { ascending: false });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Relatório de Vendas
        </h1>
      </div>

      <PainelRelatorio pedidosIniciais={pedidos ?? []} dataInicial={hoje} />
    </section>
  );
}
