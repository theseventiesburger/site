import PainelProdutos from "@/components/comanda/PainelProdutos";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function ProdutosPage() {
  const supabase = await criarClienteServidor();
  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .order("ordem", { ascending: true });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Comanda Eletrônica
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
          Produtos
        </h1>
      </div>

      <PainelProdutos produtosIniciais={produtos ?? []} />
    </section>
  );
}
