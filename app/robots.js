const SITE_URL = 'https://www.theseventiesburger.com.br';

// /comanda (ferramenta interna da equipe) e /conta, /carrinho (páginas de
// login/conta/carrinho, sem valor de busca e específicas de cada visitante)
// ficam de fora do rastreamento.
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/comanda', '/conta', '/carrinho', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
