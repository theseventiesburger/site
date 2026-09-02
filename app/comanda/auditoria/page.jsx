import PainelAuditoria from "@/components/comanda/PainelAuditoria";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function AuditoriaPage() {
  const supabase = await criarClienteServidor();
  const { data: entradas } = await supabase
    .from("auditoria")
    .select("*")
    .order("id", { ascending: false })
    .limit(50);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Auditoria
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Quem criou, alterou ou excluiu cada registro no painel.
        </p>
      </div>

      <PainelAuditoria entradasIniciais={entradas ?? []} />
    </section>
  );
}
