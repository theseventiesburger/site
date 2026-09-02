// Acesso a dados de estoque: insumos (matéria-prima), ficha técnica
// (receita_itens) e o ledger de movimentações. Recebe sempre uma instância
// do client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

export async function listarInsumos(supabase) {
  const { data, error } = await supabase.from('insumos').select('*').order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

export async function criarInsumo(supabase, dados) {
  const { data, error } = await supabase
    .from('insumos')
    .insert({
      nome: dados.nome,
      unidade: dados.unidade,
      estoque_minimo: dados.estoqueMinimo || 0,
    })
    .select()
    .single();

  if (error) throw error;

  if (dados.estoqueInicial > 0) {
    await registrarMovimento(supabase, {
      insumoId: data.id,
      quantidade: dados.estoqueInicial,
      tipo: 'entrada',
      motivo: 'Estoque inicial',
    });
  }

  return data;
}

// Nunca toca em estoque_atual — isso só muda via registrarMovimento, pra
// todo ajuste ficar registrado no ledger.
export async function atualizarInsumo(supabase, id, dados) {
  const { error } = await supabase
    .from('insumos')
    .update({
      nome: dados.nome,
      unidade: dados.unidade,
      estoque_minimo: dados.estoqueMinimo || 0,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoInsumo(supabase, id, ativo) {
  const { error } = await supabase.from('insumos').update({ ativo }).eq('id', id);
  if (error) throw error;
}

export async function registrarMovimento(supabase, { insumoId, quantidade, tipo, motivo }) {
  const { error } = await supabase.rpc('registrar_movimento_estoque', {
    p_insumo_id: insumoId,
    p_quantidade: quantidade,
    p_tipo: tipo,
    p_motivo: motivo || null,
  });

  if (error) throw error;
}

const PAGINA_MOVIMENTOS = 30;

export async function listarMovimentos(supabase, { insumoId, cursor } = {}) {
  let query = supabase
    .from('movimentos_estoque')
    .select('*')
    .order('id', { ascending: false })
    .limit(PAGINA_MOVIMENTOS);

  if (insumoId) query = query.eq('insumo_id', insumoId);
  if (cursor) query = query.lt('id', cursor);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// tipo: 'produto' | 'adicional'
export async function listarReceita(supabase, tipo, itemId) {
  const coluna = tipo === 'produto' ? 'produto_id' : 'adicional_id';
  const { data, error } = await supabase
    .from('receita_itens')
    .select('*, insumos(id, nome, unidade)')
    .eq(coluna, itemId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function adicionarItemReceita(supabase, tipo, itemId, { insumoId, quantidade }) {
  const coluna = tipo === 'produto' ? 'produto_id' : 'adicional_id';
  const { error } = await supabase.from('receita_itens').insert({
    [coluna]: itemId,
    insumo_id: insumoId,
    quantidade,
  });

  if (error) throw error;
}

export async function removerItemReceita(supabase, id) {
  const { error } = await supabase.from('receita_itens').delete().eq('id', id);
  if (error) throw error;
}
