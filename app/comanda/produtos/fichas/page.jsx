import { criarClienteServidor } from "@/lib/supabase/server";
import FichaProduto from "@/components/comanda/FichaProduto";
import BotaoImprimir from "@/components/comanda/BotaoImprimir";

export default async function FichasProdutosPage() {
  const supabase = await criarClienteServidor();

  const { data: produtos } = await supabase
    .from("produtos")
    .select("*, categorias(id, nome, emoji)")
    .order("ordem", { ascending: true });

  const produtoIds = (produtos ?? []).map((p) => p.id);
  const { data: receitas } = await supabase
    .from("receita_itens")
    .select("*, insumos(nome, unidade)")
    .in("produto_id", produtoIds.length > 0 ? produtoIds : ['00000000-0000-0000-0000-000000000000']);

  const receitaPorProduto = new Map();
  for (const item of receitas ?? []) {
    const lista = receitaPorProduto.get(item.produto_id) ?? [];
    lista.push(item);
    receitaPorProduto.set(item.produto_id, lista);
  }

  return (
    <div className="w-full flex-1 bg-[#F7F7F7] print:bg-white py-8 print:py-0">
      {(produtos ?? []).map((produto) => (
        <FichaProduto key={produto.id} produto={produto} receita={receitaPorProduto.get(produto.id) ?? []} />
      ))}
      <BotaoImprimir label="Imprimir todas" />
    </div>
  );
}
