// Propaga pra UaiRango uma mudança pontual de preço/disponibilidade — item
// (produto) ou complemento (adicional) — sem precisar ressincronizar o
// cardápio inteiro. Rotas do checklist de homologação: items/price,
// items/status, options/price e options/status.
//
// A UaiRango guarda o item com id próprio e ignora o nosso nas rotas PATCH
// de item (responde 200 e não muda nada), então o id certo é descoberto
// pelo externalCode (= produto.id) na listagem do catálogo. Complemento é
// uma opção POR PRODUTO (cada produto tem o seu grupo — ver
// sincronizarCardapio.js), então mudar um adicional significa atualizar a
// opção dele em cada produto que o oferece.

import {
  listarCatalogosUairango,
  listarItensUairango,
  atualizarPrecoItemUairango,
  atualizarStatusItemUairango,
  atualizarPrecoOpcaoUairango,
  atualizarStatusOpcaoUairango,
} from '@/lib/uairango/catalog';
import { precoItem, precoOpcao, idOpcaoUairango } from '@/lib/uairango/sincronizarCardapio';

const TAMANHO_LOTE = 20;

export async function atualizarItemDoProdutoUairango(supabaseAdmin, merchantId, produto) {
  const catalogos = await listarCatalogosUairango(supabaseAdmin, merchantId);
  const catalogId = catalogos?.[0]?.catalogId;
  if (!catalogId) return { sincronizado: false };

  const itens = await listarItensUairango(supabaseAdmin, merchantId, catalogId);
  const item = itens.get(produto.id);
  if (!item) return { sincronizado: false };

  await atualizarPrecoItemUairango(supabaseAdmin, merchantId, item.id, precoItem(produto));
  await atualizarStatusItemUairango(supabaseAdmin, merchantId, item.id, produto.ativo ? 'AVAILABLE' : 'UNAVAILABLE');
  return { sincronizado: true };
}

// produtoIds: os produtos que oferecem esse adicional (categoria liberada).
// Produto que ainda não tem o complemento lá (não sincronizado) só falha
// aquela opção — as demais seguem.
export async function atualizarOpcaoDoAdicionalUairango(supabaseAdmin, merchantId, adicional, grupo, produtoIds) {
  const preco = { value: precoOpcao(adicional, grupo) };
  const status = adicional.ativo ? 'AVAILABLE' : 'UNAVAILABLE';
  let atualizadas = 0;

  for (let i = 0; i < produtoIds.length; i += TAMANHO_LOTE) {
    const lote = produtoIds.slice(i, i + TAMANHO_LOTE);
    const resultados = await Promise.allSettled(
      lote.map(async (produtoId) => {
        const optionId = idOpcaoUairango(adicional.id, produtoId);
        await atualizarPrecoOpcaoUairango(supabaseAdmin, merchantId, optionId, preco);
        await atualizarStatusOpcaoUairango(supabaseAdmin, merchantId, optionId, status);
      })
    );
    atualizadas += resultados.filter((r) => r.status === 'fulfilled').length;
  }

  return { sincronizado: atualizadas > 0, atualizadas, produtos: produtoIds.length };
}
