export function gerarSlug(nome) {
  const semAcentos = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const slug = semAcentos.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return slug || `item-${Date.now()}`;
}
