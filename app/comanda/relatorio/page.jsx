import PainelRelatorio from "@/components/comanda/PainelRelatorio";
import { criarClienteServidor } from "@/lib/supabase/server";
import { dataHojeSP, limitesDiaComercial } from "@/lib/comanda/formato";

export default async function RelatorioPage() {
  const supabase = await criarClienteServidor();
  const hoje = dataHojeSP();
  // Carga inicial sempre com virada à meia-noite (comportamento padrão) —
  // se o usuário já tiver uma virada customizada salva, o PainelRelatorio
  // busca de novo assim que monta (a preferência mora no localStorage,
  // que só existe no navegador).
  const { inicio, fim } = limitesDiaComercial(hoje, 0);

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, itens_pedido(*, itens_pedido_adicionais(*))")
    .gte("created_at", inicio)
    .lt("created_at", fim)
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
