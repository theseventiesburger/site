// Chamadas da seção "Catalog" da API do UaiRango Connect — cardápio.
// Adicionais/complementos (option groups/options) ficam de fora da
// sincronização automática por enquanto (só produtos e categorias) — as
// funções de preço/status de complemento existem porque o checklist de
// homologação pede a rota, mesmo sem um fluxo automático chamando ainda.

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
