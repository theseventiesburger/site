// Configuração do combo dinâmico: qual produto é "a fritas do combo" e
// qual é "a bebida do combo" — sempre as mesmas pra qualquer hambúrguer
// marcado como "pode virar combo". Linha única (singleton) no banco.

export async function buscarComboConfig(supabase) {
  const { data, error } = await supabase.from('combo_config').select('*').single();
  if (error) throw error;
  return data;
}

export async function atualizarComboConfig(supabase, { fritasProdutoId, bebidaProdutoId }) {
  const { error } = await supabase
    .from('combo_config')
    .update({ fritas_produto_id: fritasProdutoId || null, bebida_produto_id: bebidaProdutoId || null })
    .eq('singleton', true);

  if (error) throw error;
}

// Bebidas que dá pra escolher no combo: as ativas da mesma categoria da
// bebida padrão (a que está em combo_config) — ver migration 0054, o banco
// valida a mesma regra.
export function opcoesBebidaCombo(produtos, comboConfig) {
  const padrao = produtos.find((p) => p.id === comboConfig?.bebida_produto_id);
  if (!padrao) return { padraoId: null, bebidas: [] };
  const bebidas = produtos
    .filter((p) => p.categoria_id === padrao.categoria_id)
    .map((p) => ({ id: p.id, nome: p.nome }));
  return { padraoId: padrao.id, bebidas };
}
