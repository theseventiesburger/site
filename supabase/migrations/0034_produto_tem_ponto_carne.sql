-- Nem todo produto tem ponto da carne (fritas, bebida, sobremesa não têm)
-- — até aqui o seletor aparecia igual pra qualquer item no carrinho.
-- Mesmo padrão de vai_para_cozinha: campo por produto, true por padrão
-- (ninguém que já usava o seletor deixa de ver ele), desmarcável no
-- cadastro pra quem não precisa. Rode este arquivo inteiro no SQL Editor
-- do Supabase.

alter table produtos add column tem_ponto_carne boolean not null default true;
