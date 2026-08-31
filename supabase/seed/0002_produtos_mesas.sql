-- Semente inicial: catálogo (espelha app/cardapio/page.jsx) e mesas 1-20.
-- Rode depois de supabase/migrations/0001_comanda.sql.

insert into produtos (slug, nome, descricao, preco, imagem, tag, categoria, ordem) values
  ('new-castle', 'New Castle', 'Hambúrguer de 160g grelhado na brasa, ovo frito, bacon super crocante, queijo muçarela derretido e maionese da casa.', 34.90, '/hb2.png', 'O Mais Pedido 🔥', 'especiais', 1),
  ('metro-black', 'Metro Black', 'Hambúrguer de 160g suculento, alface americana, tomate selecionado, queijo muçarela e maionese artesanal.', 31.90, '/hb2.png', 'Clássico Perfeito 👑', 'classicos', 2),
  ('gorgon', 'Gorgon', 'Hambúrguer de 160g, gorgonzola marcante, rúcula fresca, mel silvestre, cebola crispy e maionese da casa.', 38.90, '/hb2.png', 'Premium Especial 🌟', 'especiais', 3),
  ('classic-smash', 'Classic Smash', 'Dois smash patties de 80g, queijo cheddar duplo, picles crocante, cebola caramelizada e molho especial.', 36.90, '/hb2.png', null, 'classicos', 4),
  ('combo-new-castle', 'Combo New Castle', 'New Castle + batata rústica grande + refrigerante 400ml. O combo mais pedido da casa.', 52.90, '/hb2.png', 'Mais Econômico 💰', 'combos', 5),
  ('combo-gorgon', 'Combo Gorgon', 'Gorgon + batata frita temperada + refrigerante ou suco 400ml.', 57.90, '/hb2.png', null, 'combos', 6),
  ('refrigerante', 'Refrigerante Lata', 'Coca-Cola, Guaraná Antarctica, Sprite ou Fanta. Gelado na hora.', 7.90, '/hb2.png', null, 'bebidas', 7),
  ('milk-shake', 'Milk Shake', 'Chocolate, morango, ovomaltine ou baunilha. 400ml com muito creme.', 19.90, '/hb2.png', 'Favorito 🥛', 'bebidas', 8),
  ('brownie', 'Brownie com Sorvete', 'Brownie quentinho de chocolate meio amargo com bola de sorvete de baunilha e calda.', 16.90, '/hb2.png', null, 'sobremesas', 9);

insert into mesas (numero)
select generate_series(1, 20);
