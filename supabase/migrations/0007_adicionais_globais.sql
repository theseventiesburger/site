-- Adicionais viram um catálogo global (não mais um por produto), ligado a
-- cada produto por uma tabela de vínculo (checkbox na tela de produto).

alter table adicionais drop column produto_id;

create table produto_adicionais (
  produto_id   uuid not null references produtos(id) on delete cascade,
  adicional_id uuid not null references adicionais(id) on delete cascade,
  primary key (produto_id, adicional_id)
);

alter table produto_adicionais enable row level security;

create policy produto_adicionais_select on produto_adicionais for select to authenticated using (true);
create policy produto_adicionais_insert on produto_adicionais for insert to authenticated with check (true);
create policy produto_adicionais_delete on produto_adicionais for delete to authenticated using (true);

-- criar_pedido: valida o adicional pelo vínculo produto_adicionais em vez
-- do antigo adicionais.produto_id (que não existe mais).
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
      select adicionais.preco into v_preco_adicional
      from adicionais
      join produto_adicionais
        on produto_adicionais.adicional_id = adicionais.id
       and produto_adicionais.produto_id = v_produto_id
      where adicionais.id = (v_adicional->>'adicional_id')::uuid
        and adicionais.ativo = true;

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
      join produto_adicionais
        on produto_adicionais.adicional_id = adicionais.id
       and produto_adicionais.produto_id = v_produto_id
      where adicionais.id = (v_adicional->>'adicional_id')::uuid
        and adicionais.ativo = true;
    end loop;
  end loop;

  return v_pedido_id;
end;
$$;
