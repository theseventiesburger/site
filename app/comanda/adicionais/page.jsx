import PainelAdicionaisGlobal from "@/components/comanda/PainelAdicionaisGlobal";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function AdicionaisPage() {
  const supabase = await criarClienteServidor();

  const [{ data: adicionais }, { data: categorias }] = await Promise.all([
    supabase.from("adicionais").select("*, categorias_adicionais(id, nome, emoji)").order("ordem", { ascending: true }),
    supabase.from("categorias_adicionais").select("*").order("ordem", { ascending: true }),
  ]);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Adicionais
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Catálogo geral — marque em cada produto quais adicionais se aplicam a ele.
        </p>
      </div>

      <PainelAdicionaisGlobal adicionaisIniciais={adicionais ?? []} categoriasIniciais={categorias ?? []} />
    </section>
  );
}
