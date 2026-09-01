import CardapioInterativo from "@/components/CardapioInterativo";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function CardapioPage() {
  const supabase = await criarClienteServidor();
  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  return <CardapioInterativo produtos={produtos ?? []} />;
}
