import { notFound } from "next/navigation";
import NovoPedidoForm from "@/components/comanda/NovoPedidoForm";
import { TIPOS_PEDIDO, TIPO_LABEL } from "@/lib/comanda/constantes";
import { listarAdicionaisAtivos } from "@/lib/comanda/adicionais";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function NovoPedidoPage({ params }) {
  const { tipo } = await params;

  if (!TIPOS_PEDIDO.includes(tipo)) {
    notFound();
  }

  const supabase = await criarClienteServidor();

  const [{ data: produtos }, { data: mesas }, { data: categorias }, { data: bairros }] = await Promise.all([
    supabase.from("produtos").select("*").eq("ativo", true).order("ordem", { ascending: true }),
    tipo === "mesa"
      ? supabase.from("mesas").select("*").eq("ativa", true).order("numero", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase.from("categorias").select("*").eq("ativo", true).order("ordem", { ascending: true }),
    supabase.from("bairros").select("*").eq("ativo", true).order("nome", { ascending: true }),
  ]);

  const adicionais = await listarAdicionaisAtivos(supabase);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Novo Pedido
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          {TIPO_LABEL[tipo]}
        </h1>
      </div>

      <NovoPedidoForm
        tipo={tipo}
        produtos={produtos ?? []}
        mesas={mesas ?? []}
        adicionais={adicionais}
        categorias={categorias ?? []}
        bairros={bairros ?? []}
      />
    </section>
  );
}
