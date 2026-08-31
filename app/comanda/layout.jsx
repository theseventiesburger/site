import AlertasPedidos from "@/components/comanda/AlertasPedidos";
import ComandaTopbar from "@/components/comanda/ComandaTopbar";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = {
  title: "Comanda — The Seventies Burger",
};

export default async function ComandaLayout({ children }) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cargo = null;
  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('cargo')
      .eq('user_id', user.id)
      .maybeSingle();
    cargo = perfil?.cargo ?? null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      {user && <ComandaTopbar email={user.email} userId={user.id} />}
      {user && <AlertasPedidos cargo={cargo} />}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
