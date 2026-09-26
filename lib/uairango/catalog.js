// Chamadas da seção "Catalog" da API do UaiRango Connect — cardápio.
// Complementos (option groups/options) são sincronizados por
// sincronizarCardapio.js e mantidos por atualizarCatalogo.js — as
// funções de preço/status de item e de complemento existem porque o checklist de
// homologação pede cada rota.

import { chamarUairango } from '@/lib/uairango/http';

export async function listarCatalogosUairango(supabaseAdmin, merchantId) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/catalogs`);
}

export async function listarCategoriasUairango(supabaseAdmin, merchantId, catalogId) {
  return chamarUairango(
    supabaseAdmin,
    `/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories?includeItems=false`
  );
}

export async function criarCategoriaUairango(supabaseAdmin, merchantId, catalogId, categoria) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories`, {
    method: 'POST',
    body: JSON.stringify(categoria),
  });
}

// PUT é upsert de verdade (cria se o id não existir, substitui se existir)
// — por isso a sincronização usa produto.id como item.id/product.id direto,
// sem precisar de uma tabela de-para.
export async function criarOuAtualizarItemUairango(supabaseAdmin, merchantId, payload) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/items`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function atualizarPrecoItemUairango(supabaseAdmin, merchantId, itemId, price) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/items/price`, {
    method: 'PATCH',
    body: JSON.stringify({ itemId, price }),
  });
}

export async function atualizarStatusItemUairango(supabaseAdmin, merchantId, itemId, status) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/items/status`, {
    method: 'PATCH',
    body: JSON.stringify({ itemId, status }),
  });
}

export async function atualizarPrecoOpcaoUairango(supabaseAdmin, merchantId, optionId, price) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/options/price`, {
    method: 'PATCH',
    body: JSON.stringify({ optionId, price }),
  });
}

export async function atualizarStatusOpcaoUairango(supabaseAdmin, merchantId, optionId, status) {
  return chamarUairango(supabaseAdmin, `/catalog/v2.0/merchants/${merchantId}/options/status`, {
    method: 'PATCH',
    body: JSON.stringify({ optionId, status }),
  });
}

// Itens já existentes no catálogo, por externalCode (= produto.id): o id que
// a UaiRango deu pro item (diferente do nosso) e se ele já tem grupos de
// complemento — a sincronização usa isso pra não recriar o que já existe.
export async function listarItensUairango(supabaseAdmin, merchantId, catalogId) {
  const categorias = await chamarUairango(
    supabaseAdmin,
    `/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories?includeItems=true`
  );

  const mapa = new Map();
  for (const categoria of categorias ?? []) {
    for (const item of categoria.items ?? []) {
      if (item.externalCode) {
        mapa.set(item.externalCode, { id: item.id, temGrupos: (item.optionGroups ?? []).length > 0 });
      }
    }
  }
  return mapa;
}
