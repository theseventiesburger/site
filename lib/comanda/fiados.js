// Acesso a dados dos pedidos fiado (venda a prazo, pago=false por decisão
// — ver migration 0049) — ficam fora de Pedidos Abertos de propósito (não
// é algo aguardando confirmação imediata, é uma dívida em aberto) e têm
// tela própria aqui.

export async function listarFiados(supabase) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, itens_pedido(*, itens_pedido_adicionais(*))')
    .eq('forma_pagamento', 'fiado')
    .eq('pago', false)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Mesa gera uma rodada (`pedidos`) por lançamento — agrupa pela comanda
// pra mostrar "Mesa X deve R$Y" numa conta só, em vez de uma rodada por
// card. Pdv/delivery/retirada não têm comanda_id, cada um fica sozinho.
export function agruparFiados(pedidos) {
  const grupos = new Map();

  for (const pedido of pedidos) {
    const chave = pedido.comanda_id ?? pedido.id;
    if (!grupos.has(chave)) {
      grupos.set(chave, { chave, pedidos: [], total: 0, criadoEm: pedido.created_at });
    }
    const grupo = grupos.get(chave);
    grupo.pedidos.push(pedido);
    grupo.total += Number(pedido.total);
    if (pedido.created_at < grupo.criadoEm) grupo.criadoEm = pedido.created_at;
  }

  return [...grupos.values()].sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
}
