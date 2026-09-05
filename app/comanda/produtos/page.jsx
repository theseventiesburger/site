import PainelProdutos from "@/components/comanda/PainelProdutos";
import { listarCategoriasAdicionaisAtivas } from "@/lib/comanda/categoriasAdicionais";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function ProdutosPage() {
  const supabase = await criarClienteServidor();

  const [{ data: produtos }, { data: categorias }, { data: insumos }, categoriasAdicionais] = await Promise.all([
    supabase
      .from("produtos")
      .select("*, categorias(id, nome, emoji), produto_categorias_adicionais(categoria_adicional_id)")
      .order("ordem", { ascending: true }),
    supabase.from("categorias").select("*").order("ordem", { ascending: true }),
    supabase.from("insumos").select("*").eq("ativo", true).order("nome", { ascending: true }),
    listarCategoriasAdicionaisAtivas(supabase),
  ]);

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

      <PainelProdutos
        produtosIniciais={produtos ?? []}
        categorias={categorias ?? []}
        categoriasAdicionais={categoriasAdicionais}
        insumos={insumos ?? []}
      />
    </section>
  );
}
