import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarBRL, formatarDataHora } from "@/lib/comanda/formato";
import { STATUS_LABEL, STATUS_COR, FORMA_PAGAMENTO_LABEL } from "@/lib/comanda/constantes";

export default async function MeusPedidosPage() {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/conta/entrar?proximo=/conta/pedidos");

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, itens_pedido(*, itens_pedido_adicionais(*))")
    .order("created_at", { ascending: false });

  return (
    <section className="w-full flex-1 bg-[#F7F7F7] px-6 pt-32 pb-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/conta"
          className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block hover:text-sv-red transition-colors duration-150"
        >
          ← Minha Conta
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none mb-8">
          Meus Pedidos
        </h1>

        {(pedidos ?? []).length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-12 text-center">
            <span className="text-5xl mb-4 block">🍔</span>
            <p className="text-gray-500 text-sm font-medium mb-6">Você ainda não fez nenhum pedido.</p>
            <Link
              href="/cardapio"
              className="inline-block bg-sv-blue text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-red transition-colors duration-150"
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-black text-sv-dark text-sm">Pedido #{pedido.numero}</p>
                    <p className="text-gray-400 text-xs font-medium">{formatarDataHora(pedido.created_at)}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider ${STATUS_COR[pedido.status] ?? 'bg-gray-400'}`}>
                    {STATUS_LABEL[pedido.status] ?? pedido.status}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
                  {(pedido.itens_pedido ?? []).map((item) => (
                    <p key={item.id} className="text-gray-600 text-sm font-medium">
                      {item.quantidade}x {item.nome_produto}
                      {item.itens_pedido_adicionais?.length > 0 && (
                        <span className="text-gray-400"> ({item.itens_pedido_adicionais.map((a) => a.nome_adicional).join(', ')})</span>
                      )}
                    </p>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${pedido.pago ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {pedido.pago ? 'Pago' : 'Aguardando pagamento'}
                    </span>
                    {pedido.forma_pagamento && (
                      <span className="text-gray-400 text-xs font-bold">{FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] ?? pedido.forma_pagamento}</span>
                    )}
                  </div>
                  <span className="text-xl font-black text-sv-dark">{formatarBRL(pedido.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
