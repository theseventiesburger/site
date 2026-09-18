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

// Mesa agrupa pela comanda (uma conta, mesmo com várias rodadas). Fora da
// mesa, agrupa por cliente — mesmo cliente pode ter fiado de visitas
// diferentes (ex: uma ontem, outra hoje) e o caixa quer ver a dívida
// somada, não um card por venda. Prioridade: cadastro (cliente_id) >
// telefone > nome digitado > cada pedido sozinho, pra quem não informou nada.
function chaveDoGrupo(pedido) {
  if (pedido.comanda_id) return `comanda:${pedido.comanda_id}`;
  if (pedido.cliente_id) return `cliente:${pedido.cliente_id}`;
  if (pedido.cliente_telefone) return `tel:${pedido.cliente_telefone}`;
  if (pedido.cliente_nome) return `nome:${pedido.cliente_nome.trim().toLowerCase()}`;
  return `pedido:${pedido.id}`;
}

export function agruparFiados(pedidos) {
  const grupos = new Map();

  for (const pedido of pedidos) {
    const chave = chaveDoGrupo(pedido);
    if (!grupos.has(chave)) {
      grupos.set(chave, { chave, pedidos: [], total: 0, criadoEm: pedido.created_at });
    }
    const grupo = grupos.get(chave);
    grupo.pedidos.push(pedido);
    grupo.total += Number(pedido.total);
    if (pedido.created_at < grupo.criadoEm) grupo.criadoEm = pedido.created_at;
  }

  for (const grupo of grupos.values()) {
    grupo.pedidos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return [...grupos.values()].sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
}

// Atribui (ou corrige) o cliente de um fiado que foi lançado sem nome —
// só depois dá pra saber que era, por exemplo, a mesma Magy de outra
// venda. Depois disso o agrupamento por cliente pega esse pedido junto
// dos outros dela na próxima consulta.
export async function atribuirClienteFiado(supabase, pedidoId, cliente) {
  const { error } = await supabase
    .from('pedidos')
    .update({ cliente_id: cliente.id, cliente_nome: cliente.nome, cliente_telefone: cliente.telefone ?? null })
    .eq('id', pedidoId);
  if (error) throw error;
}

// Quita o grupo inteiro numa tacada — mesa fecha pela comanda (igual
// confirmarRecebimentoPedido), cliente fecha todos os pedidos que caíram
// no mesmo grupo (podem ser de visitas/dias diferentes).
export async function confirmarRecebimentoGrupo(supabase, grupo, formaPagamento) {
  const comandaId = grupo.pedidos[0]?.comanda_id;

  if (comandaId) {
    const { error: erroComanda } = await supabase
      .from('comandas')
      .update({ forma_pagamento: formaPagamento })
      .eq('id', comandaId);
    if (erroComanda) throw erroComanda;

    const { error: erroPedidos } = await supabase
      .from('pedidos')
      .update({ forma_pagamento: formaPagamento, pago: true })
      .eq('comanda_id', comandaId);
    if (erroPedidos) throw erroPedidos;
    return;
  }

  const { error } = await supabase
    .from('pedidos')
    .update({ forma_pagamento: formaPagamento, pago: true })
    .in('id', grupo.pedidos.map((p) => p.id));
  if (error) throw error;
}
