import CuponsPublico from "@/components/CuponsPublico";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function CuponsPage() {
  const supabase = await criarClienteServidor();
  const { data: cupons } = await supabase
    .from("cupons")
    .select("*")
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  return <CuponsPublico cupons={cupons ?? []} />;
}
