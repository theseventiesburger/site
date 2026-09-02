import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarBRL, formatarDataHora, formatarDataNascimento } from "@/lib/comanda/formato";
import { TIPO_LABEL, STATUS_LABEL, STATUS_COR, FORMA_PAGAMENTO_LABEL } from "@/lib/comanda/constantes";

export default async function RelatorioClientePage({ params }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*, bairros(id, nome, valor_entrega), pedidos(id, numero, tipo, status, total, forma_pagamento, created_at)")
    .eq("id", id)
    .order("created_at", { foreignTable: "pedidos", ascending: false })
    .maybeSingle();

  if (!cliente) notFound();

  const pedidos = cliente.pedidos ?? [];
  const pedidosValidos = pedidos.filter((p) => p.status !== "cancelado");
  const totalPedidos = pedidosValidos.length;
  const totalGasto = pedidosValidos.reduce((soma, p) => soma + Number(p.total), 0);
  const ticketMedio = totalPedidos > 0 ? totalGasto / totalPedidos : 0;

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-10 flex-1">
      <div className="mb-8">
        <Link
          href="/comanda/clientes"
          className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block hover:text-sv-red transition-colors duration-150"
        >
          ← Clientes
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-black text-sv-dark uppercase tracking-tighter leading-none">
            {cliente.nome}
          </h1>
          {cliente.codigo && (
            <span className="font-mono text-xs font-black text-sv-blue bg-sv-blue/10 px-2.5 py-1 rounded-lg tracking-wider">
              {cliente.codigo}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500 font-medium">
          {cliente.telefone && <span>{cliente.telefone}</span>}
          {(cliente.endereco || cliente.bairros?.nome) && (
            <span>{[cliente.endereco, cliente.bairros?.nome, cliente.cidade, cliente.estado].filter(Boolean).join(', ')}</span>
          )}
          {cliente.ponto_referencia && <span>Ref: {cliente.ponto_referencia}</span>}
          {cliente.data_nascimento && <span>Nasc. {formatarDataNascimento(cliente.data_nascimento)}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <CartaoResumo titulo="Pedidos feitos" valor={totalPedidos} />
        <CartaoResumo titulo="Total gasto" valor={formatarBRL(totalGasto)} />
        <CartaoResumo titulo="Ticket médio" valor={formatarBRL(ticketMedio)} />
        <CartaoResumo titulo="Pontos de fidelidade" valor={`⭐ ${cliente.pontos_saldo ?? 0}`} />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 overflow-x-auto">
        <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight mb-4">Histórico de pedidos</h2>
        {pedidos.length === 0 ? (
          <p className="text-gray-400 text-xs font-medium">Nenhum pedido ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Pagamento</th>
                <th className="py-2 pr-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-3 font-bold text-sv-dark">{pedido.numero}</td>
                  <td className="py-2.5 pr-3 text-gray-500 font-medium">{formatarDataHora(pedido.created_at)}</td>
                  <td className="py-2.5 pr-3 text-gray-600 font-medium">{TIPO_LABEL[pedido.tipo] ?? pedido.tipo}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider ${STATUS_COR[pedido.status]}`}>
                      {STATUS_LABEL[pedido.status] ?? pedido.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600 font-medium">
                    {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] ?? 'Não informado'}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-black text-sv-dark">{formatarBRL(pedido.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function CartaoResumo({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">{titulo}</p>
      <p className="text-2xl font-black text-sv-dark tracking-tight">{valor}</p>
    </div>
  );
}
