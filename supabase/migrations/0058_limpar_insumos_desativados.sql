-- Limpeza pontual: insumos desativados criados por engano durante o
-- cadastro inicial de estoque. Bacon, Carne moída (3.123kg) e Rúcula ainda
-- estavam amarrados na ficha técnica do "The King Cheddar" apesar de
-- desativados — removidos de lá primeiro (o produto para de baixar esses 3
-- até alguém recadastrar um insumo ativo pra eles e vincular de novo).
-- O "and ativo = false" no segundo delete é só uma trava de segurança:
-- se algum desses tiver sido reativado antes de rodar isso, ele não é
-- apagado à toa. Rode este arquivo inteiro no SQL Editor do Supabase.

delete from receita_itens
where produto_id = 'b29d80e8-e8c0-474e-abe7-66acce2698f9'
  and insumo_id in (
    '6be34200-6ffc-4082-a11c-d7522d455ee6', -- Bacon
    'bab1bf44-9c78-41a3-8b2a-460919b15602', -- Carne moída (3.123kg)
    'f18d17cd-363a-4c9f-8917-404097106de8'  -- Rúcula
  );

delete from insumos
where ativo = false
  and id in (
    '199cb8a5-131b-4eb8-b34c-1666cb9c6ed1', -- Alface
    '6be34200-6ffc-4082-a11c-d7522d455ee6', -- Bacon
    '57f9d9ab-1fe5-47f0-aece-13cfa1c9643b', -- Carne moída (8159kg, duplicado)
    'bab1bf44-9c78-41a3-8b2a-460919b15602', -- Carne moída (3.123kg)
    '9ace737e-c8f7-4461-af62-c9360c93e646', -- Geleia de pimenta
    'a5511fa0-b319-4add-81b2-1512c0c8c22b', -- Onions
    '7e53b3a1-f41e-4345-9649-961e82081bc2', -- Pão brioche
    '095bb5eb-9c20-4799-924f-279cd0d0c56a', -- Pão tradicional
    '103b7e12-0337-41e6-af59-0452ce28e698', -- Queijo Cheddar Fatiado
    'f79270e0-d7ed-47c9-9484-29d48f651291', -- Queijo Mussarela
    'f18d17cd-363a-4c9f-8917-404097106de8', -- Rúcula
    'd71383d7-aff4-4314-8afc-0e19616a901f', -- Sorvete de baunilha
    'cfc7cce6-46d7-446c-909f-ec3f9c172e68', -- Sorvete de chocolate
    '340ef457-4c85-499f-94c7-ae2e5853fc88'  -- Sorvete de morango
  );
