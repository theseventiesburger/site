import Link from "next/link";
import CartaoTipoPedido from "@/components/comanda/CartaoTipoPedido";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function ComandaHubPage() {
  const supabase = await criarClienteServidor();
  const { data: pedidosAbertos } = await supabase
    .from("pedidos")
    .select("tipo")
    .not("status", "in", "(entregue,cancelado)");

  const { count: totalAguardandoPagamento } = await supabase
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("status", "entregue")
    .eq("pago", false);

  const contarPorTipo = (tipo) =>
    (pedidosAbertos ?? []).filter((p) => p.tipo === tipo).length;

  const totalAbertos = pedidosAbertos?.length ?? 0;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12 flex-1">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
            Comanda Eletrônica
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter leading-none">
            Novo Pedido
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/comanda/abertos"
            className="inline-flex items-center gap-2 bg-white text-sv-dark border border-gray-200 font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all duration-200 hover:border-sv-blue hover:text-sv-blue hover:scale-105 shadow-md"
          >
            💰 Pedidos Abertos
            {totalAguardandoPagamento > 0 && (
              <span className="bg-sv-red text-white rounded-full px-2 py-0.5 text-[11px]">
                {totalAguardandoPagamento}
              </span>
            )}
          </Link>
          <Link
            href="/comanda/cozinha"
            className="inline-flex items-center gap-2 bg-sv-dark text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all duration-200 hover:bg-sv-red hover:scale-105 shadow-md"
          >
            🍳 Ver Cozinha
            {totalAbertos > 0 && (
              <span className="bg-white text-sv-dark rounded-full px-2 py-0.5 text-[11px]">
                {totalAbertos}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CartaoTipoPedido
          tipo="mesa"
          titulo="Mesa"
          descricao="Lançar pedido para uma mesa do salão."
          emoji="🍽️"
          contador={contarPorTipo("mesa")}
        />
        <CartaoTipoPedido
          tipo="delivery"
          titulo="Delivery"
          descricao="Pedido para entrega com endereço do cliente."
          emoji="🛵"
          contador={contarPorTipo("delivery")}
        />
        <CartaoTipoPedido
          tipo="pdv"
          titulo="Ponto de Venda"
          descricao="Venda direto no balcão/caixa."
          emoji="🧾"
          contador={contarPorTipo("pdv")}
        />
      </div>
    </section>
  );
}
