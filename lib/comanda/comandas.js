// Acesso a dados da comanda de mesa (a conta aberta, que agrupa as rodadas
// de `pedidos` de uma mesa). Mesmo padrão de lib/comanda/pedidos.js: recebe
// sempre uma instância do client Supabase.

export async function listarMesasComComandas(supabase) {
  const [{ data: mesas, error: erroMesas }, { data: comandas, error: erroComandas }] = await Promise.all([
    supabase.from('mesas').select('*').eq('ativa', true).order('numero', { ascending: true }),
    supabase.from('comandas').select('*').eq('status', 'aberta'),
  ]);

  if (erroMesas) throw erroMesas;
  if (erroComandas) throw erroComandas;

  const comandaPorMesa = new Map((comandas ?? []).map((c) => [c.mesa_id, c]));
  return (mesas ?? []).map((mesa) => ({ ...mesa, comanda: comandaPorMesa.get(mesa.numero) ?? null }));
}

export async function buscarComandaAbertaPorMesa(supabase, mesaNumero) {
  const { data, error } = await supabase
    .from('comandas')
    .select('*, pedidos(*, itens_pedido(*, itens_pedido_adicionais(*)))')
    .eq('mesa_id', mesaNumero)
    .eq('status', 'aberta')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function abrirComanda(supabase, mesaNumero) {
  const { data, error } = await supabase.rpc('abrir_comanda', { p_mesa: mesaNumero });
  if (error) throw error;
  return data; // uuid da comanda (nova ou já aberta)
}

export async function fecharComanda(supabase, comandaId, { formaPagamento, taxaServico, desconto, itensCortesiaIds }) {
  const { error } = await supabase.rpc('fechar_comanda', {
    p_comanda_id: comandaId,
    p_forma_pagamento: formaPagamento,
    p_taxa_servico: taxaServico ?? null,
    p_desconto: desconto ?? null,
    p_itens_cortesia: itensCortesiaIds ?? null,
  });

  if (error) throw error;
}
