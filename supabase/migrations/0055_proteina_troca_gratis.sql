-- Troca de proteína sem custo: a categoria "Proteínas" já existe (0009) e
-- já tem Bovino/Frango/Linguiça/Vegano/Vegetariano cadastrados como
-- adicional dos hambúrgueres, mas cobrava como se fosse um acréscimo (a
-- exemplo de "trocar o pão", que já usa gratuita_tipos desde a 0012). Ativa
-- o mesmo mecanismo pra "Proteínas": vira uma troca (radio, "Padrão" ou uma
-- das opções) em vez de somar preço, em mesa, delivery e pdv. Rode este
-- arquivo inteiro no SQL Editor do Supabase.

update categorias_adicionais
set gratuita_tipos = array['mesa', 'delivery', 'pdv']
where slug = 'proteinas';
