import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import PainelConta from "@/components/site/PainelConta";

export default async function ContaPage() {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/conta/entrar?proximo=/conta");

  const [{ data: cliente }, { data: bairros }] = await Promise.all([
    supabase.from("clientes").select("*").maybeSingle(),
    supabase.from("bairros").select("*").eq("ativo", true).order("ordem", { ascending: true }),
  ]);

  return (
    <section className="w-full flex-1 bg-[#F7F7F7] px-6 pt-32 pb-16">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">Minha Conta</span>
            <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
              Meus Dados
            </h1>
          </div>
          <Link
            href="/conta/pedidos"
            className="bg-white text-sv-dark border border-gray-200 font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-all duration-200 hover:border-sv-blue hover:text-sv-blue"
          >
            📦 Meus Pedidos
          </Link>
        </div>

        <PainelConta cliente={cliente} email={user.email} bairros={bairros ?? []} />
      </div>
    </section>
  );
}
