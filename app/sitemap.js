const SITE_URL = 'https://www.theseventiesburger.com.br';

// Só páginas públicas com valor de busca — /comanda (equipe), /conta,
// /carrinho (login/conta/carrinho) e /appseventies, /clube (redirecionados
// pro "/" enquanto essas features não têm regra definida, ver
// next.config.mjs) ficam de fora.
export default function sitemap() {
  const agora = new Date();

  const paginas = [
    { url: '/', changeFrequency: 'weekly', priority: 1 },
    { url: '/cardapio', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/cupons', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/delivery', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/contato', changeFrequency: 'yearly', priority: 0.5 },
    { url: '/privacidade', changeFrequency: 'yearly', priority: 0.2 },
    { url: '/informacoes-legais', changeFrequency: 'yearly', priority: 0.2 },
    { url: '/regulamento-clube', changeFrequency: 'yearly', priority: 0.2 },
  ];

  return paginas.map((pagina) => ({
    url: `${SITE_URL}${pagina.url}`,
    lastModified: agora,
    changeFrequency: pagina.changeFrequency,
    priority: pagina.priority,
  }));
}
