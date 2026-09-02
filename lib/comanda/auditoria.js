// Consulta ao histórico de auditoria (tabela `auditoria`, populada só por
// trigger no banco — nunca inserida pelo cliente).

const PAGINA = 50;

export async function listarAuditoria(supabase, { tabela, cursor } = {}) {
  let query = supabase
    .from('auditoria')
    .select('*')
    .order('id', { ascending: false })
    .limit(PAGINA);

  if (tabela) query = query.eq('tabela', tabela);
  if (cursor) query = query.lt('id', cursor);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
