-- Preço promocional por produto — quando preenchido, o produto entra em
-- promoção: preço riscado no cardápio e destaque no slider principal do
-- site. Rode este arquivo inteiro no SQL Editor do Supabase.

alter table produtos add column preco_promocional numeric(10,2)
  check (preco_promocional is null or (preco_promocional > 0 and preco_promocional < preco));
