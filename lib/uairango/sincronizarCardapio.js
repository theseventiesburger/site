// Empurra categorias, produtos e complementos daqui pro cardápio do UaiRango.
// Cada produto/categoria/adicional vai com o próprio uuid como externalCode.
//
// O que a UaiRango faz de diferente do esperado (descoberto testando no
// sandbox, e por isso o desenho abaixo):
// - O ITEM é guardado com id próprio (não o nosso) e casado pelo
//   externalCode — reenviar só atualiza, não duplica.
// - Grupo de complemento só é definido na chamada que o CRIA. Reenviar as
//   mesmas opções depois derruba o grupo pra 1 opção, e um grupo criado num
//   produto não pode ser reaproveitado em outro (recusa "grupo não
//   encontrado"). Por isso cada produto ganha o seu próprio grupo/opções
//   (ids derivados do par adicional+produto, estáveis) e eles são criados
//   UMA vez: nas sincronizações seguintes só preço/status são atualizados
//   pelas rotas PATCH, sem tocar nos grupos.
// - O id da opção precisa ser diferente do id do produto que ela representa
//   (senão só a primeira opção do grupo é guardada).
//
// Categoria de troca grátis (ex: Pães, Proteínas) vira grupo de escolha
// única (max 1) e as opções saem a R$ 0 — pedido do UaiRango é
// delivery/retirada, então vale a regra de delivery.

import crypto from 'node:crypto';
import {
  listarCatalogosUairango,
  listarCategoriasUairango,
  listarItensUairango,
  criarCategoriaUairango,
  criarOuAtualizarItemUairango,
  atualizarPrecoItemUairango,
  atualizarStatusItemUairango,
} from '@/lib/uairango/catalog';

const TAMANHO_LOTE = 5;

// Entra nos ids de grupo/opção. A UaiRango não religa uma opção que já existe
// a um grupo novo: se algum dia os grupos forem apagados direto no painel
// deles, as opções ficam órfãs com o mesmo id e o grupo recriado vem vazio.
// Nesse caso suba este valor pra gerar ids novos na próxima sincronização.
const VERSAO_IDS = 'v2';

export function precoItem(produto) {
  const precoPromocional = produto.preco_promocional != null ? Number(produto.preco_promocional) : null;
  if (precoPromocional != null && precoPromocional < Number(produto.preco)) {
    return { value: precoPromocional, originalValue: Number(produto.preco) };
  }
  return { value: Number(produto.preco) };
}

export function precoOpcao(adicional, grupo) {
  return (grupo?.gratuita_tipos ?? []).includes('delivery') ? 0 : Number(adicional.preco);
}

function trocaGratis(grupo) {
  return (grupo.gratuita_tipos ?? []).length > 0;
}

function uuidDerivado(texto) {
  const h = crypto.createHash('sha1').update(texto).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function idGrupoUairango(categoriaAdicionalId, produtoId) {
  return uuidDerivado(`${categoriaAdicionalId}:${produtoId}:grupo:${VERSAO_IDS}`);
}

export function idOpcaoUairango(adicionalId, produtoId) {
  return uuidDerivado(`${adicionalId}:${produtoId}:opcao:${VERSAO_IDS}`);
}

// Monta o corpo do PUT /items. Com grupos, cria os complementos do produto;
// sem grupos, manda só o item (não mexe em nada de complemento que já exista).
export function montarPayloadItem({ produto, categoryId, grupos = [], opcoesPorGrupo = new Map() }) {
  const opcoes = grupos.flatMap((g) => (opcoesPorGrupo.get(g.id) ?? []).map((a) => ({ adicional: a, grupo: g })));

  const produtoDoItem = {
    id: produto.id,
    name: produto.nome,
    description: produto.descricao || '',
    externalCode: produto.id,
    status: 'AVAILABLE',
  };
  if (grupos.length > 0) {
    produtoDoItem.optionGroups = grupos.map((g) => ({
      id: idGrupoUairango(g.id, produto.id),
      min: 0,
      max: trocaGratis(g) ? 1 : (opcoesPorGrupo.get(g.id) ?? []).length,
    }));
  }

  const payload = {
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
      produtoDoItem,
      ...opcoes.map(({ adicional }) => ({
        id: adicional.id,
        name: adicional.nome,
        description: '',
        externalCode: adicional.id,
      })),
    ],
  };

  if (grupos.length > 0) {
    payload.optionGroups = grupos.map((g, indice) => ({
      id: idGrupoUairango(g.id, produto.id),
      name: g.nome,
      externalCode: g.id,
      status: 'AVAILABLE',
      index: indice,
      optionGroupType: 'DEFAULT',
      optionIds: (opcoesPorGrupo.get(g.id) ?? []).map((a) => idOpcaoUairango(a.id, produto.id)),
    }));
    payload.options = opcoes.map(({ adicional, grupo }) => ({
      id: idOpcaoUairango(adicional.id, produto.id),
      status: 'AVAILABLE',
      productId: adicional.id,
      price: { value: precoOpcao(adicional, grupo) },
      externalCode: adicional.id,
    }));
  }

  return payload;
}

// A UaiRango responde 500 de vez em quando ao criar item com complementos
// (vários já passaram na segunda tentativa) — tenta de novo antes de desistir.
async function comRetentativa(fn, tentativas = 3) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i += 1) {
    try {
      return await fn();
    } catch (err) {
      ultimoErro = err;
      if (!err.message.includes('(500)')) throw err;
      await new Promise((resolver) => setTimeout(resolver, 700 * (i + 1)));
    }
  }
  throw ultimoErro;
}

async function emLotes(lista, tamanho, fn) {
  const resultados = [];
  for (let i = 0; i < lista.length; i += tamanho) {
    resultados.push(...(await Promise.all(lista.slice(i, i + tamanho).map(fn))));
  }
  return resultados;
}

export async function sincronizarCardapioUairango(supabaseAdmin, merchantId) {
  const catalogos = await listarCatalogosUairango(supabaseAdmin, merchantId);
  const catalogo = catalogos?.[0];
  if (!catalogo) {
    throw new Error('Nenhum catálogo encontrado pra essa loja no UaiRango.');
  }

  const [{ data: categorias }, { data: produtos }, { data: gruposAdicionais }, { data: adicionais }, { data: vinculos }] =
    await Promise.all([
      supabaseAdmin.from('categorias').select('id, nome').eq('ativo', true),
      supabaseAdmin.from('produtos').select('id, nome, descricao, preco, preco_promocional, categoria_id, ativo'),
      supabaseAdmin.from('categorias_adicionais').select('id, nome, gratuita_tipos').eq('ativo', true).order('ordem'),
      supabaseAdmin
        .from('adicionais')
        .select('id, nome, preco, categoria_id')
        .eq('ativo', true)
        .not('categoria_id', 'is', null)
        .order('ordem'),
      supabaseAdmin.from('produto_categorias_adicionais').select('produto_id, categoria_adicional_id'),
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

  const opcoesPorGrupo = new Map();
  for (const adicional of adicionais ?? []) {
    const lista = opcoesPorGrupo.get(adicional.categoria_id) ?? [];
    lista.push(adicional);
    opcoesPorGrupo.set(adicional.categoria_id, lista);
  }
  const gruposComOpcao = (gruposAdicionais ?? []).filter((g) => opcoesPorGrupo.get(g.id)?.length > 0);

  const gruposPorProduto = new Map();
  for (const vinculo of vinculos ?? []) {
    const grupo = gruposComOpcao.find((g) => g.id === vinculo.categoria_adicional_id);
    if (!grupo) continue;
    const lista = gruposPorProduto.get(vinculo.produto_id) ?? [];
    lista.push(grupo);
    gruposPorProduto.set(vinculo.produto_id, lista);
  }

  const itensExistentes = await listarItensUairango(supabaseAdmin, merchantId, catalogo.catalogId);

  let itensSincronizados = 0;
  let itensComComplementos = 0;
  const erros = [];

  await emLotes(produtos ?? [], TAMANHO_LOTE, async (produto) => {
    const categoryId = idPorExternalCode.get(produto.categoria_id);
    if (!categoryId) {
      erros.push(`${produto.nome}: categoria não sincronizada (categoria inativa?)`);
      return;
    }

    const existente = itensExistentes.get(produto.id);
    const grupos = gruposPorProduto.get(produto.id) ?? [];
    const precisaCriarComplementos = grupos.length > 0 && !existente?.temGrupos;

    try {
      if (existente && !precisaCriarComplementos) {
        // Item já está lá (com ou sem complementos): só preço e disponibilidade,
        // pelas rotas próprias — reenviar o PUT não atualiza preço e ainda
        // arriscaria mexer nos grupos.
        await comRetentativa(() => atualizarPrecoItemUairango(supabaseAdmin, merchantId, existente.id, precoItem(produto)));
        await comRetentativa(() =>
          atualizarStatusItemUairango(supabaseAdmin, merchantId, existente.id, produto.ativo ? 'AVAILABLE' : 'UNAVAILABLE')
        );
      } else {
        const payload = montarPayloadItem({ produto, categoryId, grupos: precisaCriarComplementos ? grupos : [], opcoesPorGrupo });
        await comRetentativa(() => criarOuAtualizarItemUairango(supabaseAdmin, merchantId, payload));
        if (precisaCriarComplementos) itensComComplementos += 1;
      }
      itensSincronizados += 1;
    } catch (err) {
      erros.push(`${produto.nome}: ${err.message}`);
    }
  });

  return { categoriasCriadas, itensSincronizados, itensComComplementos, erros };
}
