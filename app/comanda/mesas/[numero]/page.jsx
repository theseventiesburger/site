import { notFound } from "next/navigation";
import PainelMesa from "@/components/comanda/PainelMesa";
import { listarAdicionaisAtivos } from "@/lib/comanda/adicionais";
import { buscarComandaAbertaPorMesa } from "@/lib/comanda/comandas";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function MesaPage({ params }) {
  const { numero } = await params;
  const mesaNumero = Number(numero);

  const supabase = await criarClienteServidor();

  const [{ data: mesa }, { data: produtos }, { data: categorias }, comanda] = await Promise.all([
    supabase.from("mesas").select("*").eq("numero", mesaNumero).eq("ativa", true).maybeSingle(),
    supabase
      .from("produtos")
      .select("*, produto_categorias_adicionais(categoria_adicional_id)")
      .eq("ativo", true)
      .order("ordem", { ascending: true }),
    supabase.from("categorias").select("*").eq("ativo", true).order("ordem", { ascending: true }),
    buscarComandaAbertaPorMesa(supabase, mesaNumero),
  ]);

  if (!mesa) notFound();

  const adicionais = await listarAdicionaisAtivos(supabase);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Mesa {mesa.numero}{mesa.apelido ? ` — ${mesa.apelido}` : ''}
        </h1>
      </div>

      <PainelMesa
        mesa={mesa}
        comandaInicial={comanda}
        produtos={produtos ?? []}
        categorias={categorias ?? []}
        adicionais={adicionais}
      />
    </section>
  );
}
