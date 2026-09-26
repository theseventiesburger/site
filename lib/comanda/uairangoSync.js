// Avisa o servidor que um produto/adicional mudou (preço ou ativo) pra ele
// atualizar o cardápio no UaiRango. Melhor esforço: a falha aqui nunca
// pode atrapalhar quem está editando o cadastro.

function avisar(caminho, corpo) {
  fetch(caminho, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  }).catch(() => {});
}

export function avisarUairangoProduto(produtoId) {
  avisar('/api/uairango/catalogo/produto', { produtoId });
}

export function avisarUairangoAdicional(adicionalId) {
  avisar('/api/uairango/catalogo/adicional', { adicionalId });
}
