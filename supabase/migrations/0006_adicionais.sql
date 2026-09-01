-- Adicionais por produto (com preço próprio, somado ao item do pedido).

create table adicionais (
  id         uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  nome       text not null,
  preco      numeric(10,2) not null check (preco >= 0),
  ativo      boolean not null default true,
  ordem      smallint not null default 0,
  created_at timestamptz not null default now()
);

create index adicionais_produto_id_idx on adicionais (produto_id);

-- Snapshot dos adicionais escolhidos em cada item — nome/preço travados na
-- venda, não mudam se o adicional for editado/desativado depois.
create table itens_pedido_adicionais (
  id              uuid primary key default gen_random_uuid(),
  item_pedido_id  uuid not null references itens_pedido(id) on delete cascade,
  nome_adicional  text not null,
  preco_adicional numeric(10,2) not null check (preco_adicional >= 0),
  created_at      timestamptz not null default now()
);

create index itens_pedido_adicionais_item_idx on itens_pedido_adicionais (item_pedido_id);

-- subtotal precisa somar produto + adicionais, não dá mais pra ser uma
-- coluna gerada (não pode referenciar outra tabela). Converte preservando
-- os valores já gravados.
alter table itens_pedido alter column subtotal drop expression;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table adicionais enable row level security;

create policy adicionais_select on adicionais for select to authenticated using (true);
create policy adicionais_insert on adicionais for insert to authenticated with check (true);
create policy adicionais_update on adicionais for update to authenticated using (true) with check (true);

alter table itens_pedido_adicionais enable row level security;

create policy itens_pedido_adicionais_select on itens_pedido_adicionais for select to authenticated using (true);
create policy itens_pedido_adicionais_insert on itens_pedido_adicionais for insert to authenticated with check (true);

-- ─── criar_pedido: agora resolve adicionais por item ──────────────────────
create or replace function criar_pedido(
  p_tipo             text,
  p_mesa             smallint default null,
  p_cliente_nome     text default null,
  p_cliente_telefone text default null,
  p_endereco         text default null,
  p_taxa_entrega     numeric default 0,
  p_forma_pagamento  text default null,
  p_observacoes      text default null,
  p_itens            jsonb default '[]'::jsonb
) returns uuid
language plpgsql security invoker as $$
declare
  v_pedido_id       uuid;
  v_item            jsonb;
  v_adicional       jsonb;
  v_item_pedido_id  uuid;
  v_produto_id      uuid;
  v_soma_adicionais numeric;
  v_preco_adicional numeric;
begin
  insert into pedidos (
    tipo, mesa_id, cliente_nome, cliente_telefone, endereco,
    taxa_entrega, forma_pagamento, observacoes
  ) values (
    p_tipo, p_mesa, p_cliente_nome, p_cliente_telefone, p_endereco,
    coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    v_produto_id := (v_item->>'produto_id')::uuid;
    v_soma_adicionais := 0;

    for v_adicional in select * from jsonb_array_elements(coalesce(v_item->'adicionais', '[]'::jsonb))
    loop
      select preco into v_preco_adicional
      from adicionais
      where id = (v_adicional->>'adicional_id')::uuid
        and produto_id = v_produto_id
        and ativo = true;

      v_soma_adicionais := v_soma_adicionais + coalesce(v_preco_adicional, 0);
    end loop;

    insert into itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade, observacao, subtotal)
    select
      v_pedido_id,
      produtos.id,
      produtos.nome,
      produtos.preco,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao',
      (produtos.preco + v_soma_adicionais) * (v_item->>'quantidade')::smallint
    from produtos
    where produtos.id = v_produto_id
    returning id into v_item_pedido_id;

    for v_adicional in select * from jsonb_array_elements(coalesce(v_item->'adicionais', '[]'::jsonb))
    loop
      insert into itens_pedido_adicionais (item_pedido_id, nome_adicional, preco_adicional)
      select v_item_pedido_id, adicionais.nome, adicionais.preco
      from adicionais
      where adicionais.id = (v_adicional->>'adicional_id')::uuid
        and adicionais.produto_id = v_produto_id
        and adicionais.ativo = true;
    end loop;
  end loop;

  return v_pedido_id;
end;
$$;
