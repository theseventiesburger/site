import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import FichaProduto from "@/components/comanda/FichaProduto";
import BotaoImprimir from "@/components/comanda/BotaoImprimir";

export default async function FichaProdutoPage({ params }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const [{ data: produto }, { data: receita }] = await Promise.all([
    supabase.from("produtos").select("*, categorias(id, nome, emoji)").eq("id", id).maybeSingle(),
    supabase.from("receita_itens").select("*, insumos(nome, unidade)").eq("produto_id", id).order("created_at", { ascending: true }),
  ]);

  if (!produto) notFound();

  return (
    <div className="w-full flex-1 bg-[#F7F7F7] print:bg-white py-8 print:py-0">
      <FichaProduto produto={produto} receita={receita ?? []} />
      <BotaoImprimir label="Imprimir ficha" />
    </div>
  );
}
