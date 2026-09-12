import CardapioInterativo from "@/components/CardapioInterativo";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = {
  title: "Cardápio",
  description: "Hambúrgueres artesanais, combos, porções e bebidas da The Seventies Burger. Veja o cardápio completo e peça pelo site, WhatsApp ou UaiRango.",
};

export default async function CardapioPage() {
  const supabase = await criarClienteServidor();

  const [{ data: produtos }, { data: categorias }] = await Promise.all([
    supabase
      .from("produtos")
      .select("*, produto_tamanhos(id, nome, preco, ordem)")
      .eq("ativo", true)
      .order("ordem", { ascending: true }),
    supabase.from("categorias").select("*").eq("ativo", true).order("ordem", { ascending: true }),
  ]);

  return <CardapioInterativo produtos={produtos ?? []} categorias={categorias ?? []} />;
}
