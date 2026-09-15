// Empurra categorias/produtos daqui pro cardápio do UaiRango. Usa o próprio
// id (uuid) de cada categoria/produto como externalCode/id do lado deles —
// como criarOuAtualizarItemUairango é um PUT de verdade (upsert por id),
// rodar de novo só atualiza em vez de duplicar, sem precisar de tabela
// de-para nenhuma. Categoria não tem PUT idempotente (só POST criar), então
// aqui ela só é criada se ainda não existir (comparando pelo externalCode
// que a listagem devolve) — edição de nome de categoria já existente fica
// de fora por enquanto.
//
// Fora do escopo desta sincronização: adicionais/complementos (option
// groups/options) — os produtos vão sem eles. As funções de
// preço/status de complemento existem em catalog.js, prontas pra quando
// isso for encaixado.

import {
  listarCatalogosUairango,
  listarCategoriasUairango,
  criarCategoriaUairango,
  criarOuAtualizarItemUairango,
} from '@/lib/uairango/catalog';

function precoItem(produto) {
  const precoPromocional = produto.preco_promocional != null ? Number(produto.preco_promocional) : null;
  if (precoPromocional != null && precoPromocional < Number(produto.preco)) {
    return { value: precoPromocional, originalValue: Number(produto.preco) };
  }
  return { value: Number(produto.preco) };
}

export async function sincronizarCardapioUairango(supabaseAdmin, merchantId) {
  const catalogos = await listarCatalogosUairango(supabaseAdmin, merchantId);
  const catalogo = catalogos?.[0];
  if (!catalogo) {
    throw new Error('Nenhum catálogo encontrado pra essa loja no UaiRango.');
  }

  const [{ data: categorias }, { data: produtos }] = await Promise.all([
    supabaseAdmin.from('categorias').select('id, nome').eq('ativo', true),
    supabaseAdmin.from('produtos').select('id, nome, descricao, preco, preco_promocional, categoria_id, ativo'),
  ]);

  const categoriasExistentes = await listarCategoriasUairango(supabaseAdmin, merchantId, catalogo.catalogId);
  const idPorExternalCode = new Map((categoriasExistentes ?? []).map((c) => [c.externalCode, c.id]));

  let categoriasCriadas = 0;
  for (const categoria of categorias ?? []) {
    if (idPorExternalCode.has(categoria.id)) continue;
    const criada = await criarCategoriaUairango(supabaseAdmin, merchantId, catalogo.catalogId, {
      name: categoria.nome,
      externalCode: categoria.id,
      status: 'AVAILABLE',
      template: 'DEFAULT',
    });
    idPorExternalCode.set(categoria.id, criada.id);
    categoriasCriadas += 1;
  }

  let itensSincronizados = 0;
  const erros = [];

  for (const produto of produtos ?? []) {
    const categoryId = idPorExternalCode.get(produto.categoria_id);
    if (!categoryId) {
      erros.push(`${produto.nome}: categoria não sincronizada (categoria inativa?)`);
      continue;
    }

    try {
      await criarOuAtualizarItemUairango(supabaseAdmin, merchantId, {
        item: {
          id: produto.id,
          categoryId,
          productId: produto.id,
          type: 'DEFAULT',
          price: precoItem(produto),
          externalCode: produto.id,
          status: produto.ativo ? 'AVAILABLE' : 'UNAVAILABLE',
        },
        products: [
          {
            id: produto.id,
            name: produto.nome,
            description: produto.descricao || '',
            externalCode: produto.id,
            status: 'AVAILABLE',
          },
        ],
        optionGroups: [],
        options: [],
      });
      itensSincronizados += 1;
    } catch (err) {
      erros.push(`${produto.nome}: ${err.message}`);
    }
  }

  return { categoriasCriadas, itensSincronizados, erros };
}
