// Acesso a dados do admin de produtos. Recebe sempre uma instância do
// client Supabase (criarClienteBrowser()) — mantém as queries fora da JSX.

import { gerarSlug } from '@/lib/comanda/slug';

export async function listarTodosProdutos(supabase) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias(id, nome, emoji)')
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarProduto(supabase, dados) {
  const { error } = await supabase.from('produtos').insert({
    slug: gerarSlug(dados.nome),
    nome: dados.nome,
    descricao: dados.descricao || null,
    preco: dados.preco,
    preco_promocional: dados.precoPromocional || null,
    imagem: dados.imagem || '/hb2.png',
    tag: dados.tag || null,
    categoria_id: dados.categoriaId,
    ativo: dados.ativo ?? true,
    vai_para_cozinha: dados.vaiParaCozinha ?? true,
    ordem: dados.ordem ?? 0,
  });

  if (error) throw error;
}

export async function atualizarProduto(supabase, id, dados) {
  const { error } = await supabase
    .from('produtos')
    .update({
      nome: dados.nome,
      descricao: dados.descricao || null,
      preco: dados.preco,
      preco_promocional: dados.precoPromocional || null,
      imagem: dados.imagem || '/hb2.png',
      tag: dados.tag || null,
      categoria_id: dados.categoriaId,
      ativo: dados.ativo ?? true,
      vai_para_cozinha: dados.vaiParaCozinha ?? true,
      ordem: dados.ordem ?? 0,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function alternarAtivoProduto(supabase, id, ativo) {
  const { error } = await supabase.from('produtos').update({ ativo }).eq('id', id);
  if (error) throw error;
}

export async function enviarImagemProduto(supabase, arquivo) {
  const extensao = arquivo.name.split('.').pop();
  const caminho = `${crypto.randomUUID()}.${extensao}`;

  const { error } = await supabase.storage.from('produtos').upload(caminho, arquivo, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('produtos').getPublicUrl(caminho);
  return data.publicUrl;
}
