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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      {user && <ComandaTopbar email={user.email} />}
      {user && <AlertasPedidos />}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
