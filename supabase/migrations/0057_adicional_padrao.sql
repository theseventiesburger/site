-- Item "padrão" de uma categoria de adicional gratuita — o que já vem no
-- produto sem precisar escolher nada, tipo o pão tradicional do
-- hambúrguer. Até aqui a troca de pão (categoria "Pães", gratuita pra
-- mesa) só registrava consumo de estoque quando alguém pedia uma troca
-- explícita (Brioche, Australiano etc) — o pão tradicional nunca aparecia
-- como itens_pedido_adicionais, então a ficha técnica dele nunca debitava
-- nada. E colocar o pão na ficha do próprio hambúrguer debitaria sempre o
-- tradicional, mesmo quando o cliente trocasse.
--
-- Agora dá pra marcar um item da categoria como "padrão": ele entra
-- pré-selecionado ao montar o pedido (a troca continua funcionando igual,
-- só muda a pré-seleção) e pode ter ficha técnica própria como qualquer
-- outro adicional — nenhuma mudança precisa em criar_pedido ou nos
-- gatilhos de baixa de estoque, o padrão só percorre o mesmo caminho que
-- uma escolha manual já percorria. Rode este arquivo inteiro no SQL
-- Editor do Supabase.

alter table adicionais add column padrao boolean not null default false;

-- No máximo um padrão por categoria.
create unique index adicionais_categoria_padrao_unq
  on adicionais (categoria_id)
  where padrao = true and categoria_id is not null;
