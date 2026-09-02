-- Cadastro de clientes — nome, telefone, endereço e data de nascimento.
-- Pedidos passam a poder ser vinculados a um cliente cadastrado.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

create table clientes (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  telefone        text,
  endereco        text,
  data_nascimento date,
  created_at      timestamptz not null default now()
);

create index clientes_nome_idx on clientes (nome);

alter table clientes enable row level security;

create policy clientes_select on clientes for select to authenticated using (true);
create policy clientes_insert on clientes for insert to authenticated with check (true);
create policy clientes_update on clientes for update to authenticated using (true) with check (true);

alter table pedidos add column cliente_id uuid references clientes(id) on delete set null;

create index pedidos_cliente_id_idx on pedidos (cliente_id);

-- criar_pedido: aceita p_cliente_id opcional pra vincular o pedido ao
-- cadastro do cliente. Os campos de texto livre (cliente_nome/telefone)
-- continuam existindo pra pedidos sem cliente cadastrado.
create or replace function criar_pedido(
  p_tipo             text,
  p_mesa             smallint default null,
  p_cliente_id       uuid default null,
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
    tipo, mesa_id, cliente_id, cliente_nome, cliente_telefone, endereco,
    taxa_entrega, forma_pagamento, observacoes
  ) values (
    p_tipo, p_mesa, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
    coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    v_produto_id := (v_item->>'produto_id')::uuid;
    v_soma_adicionais := 0;

    for v_adicional in select * from jsonb_array_elements(coalesce(v_item->'adicionais', '[]'::jsonb))
    loop
      select case
               when p_tipo = any(coalesce(categorias_adicionais.gratuita_tipos, '{}')) then 0
               else adicionais.preco
             end
        into v_preco_adicional
      from adicionais
      left join categorias_adicionais on categorias_adicionais.id = adicionais.categoria_id
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
      select
        v_item_pedido_id,
        adicionais.nome,
        case
          when p_tipo = any(coalesce(categorias_adicionais.gratuita_tipos, '{}')) then 0
          else adicionais.preco
        end
      from adicionais
      left join categorias_adicionais on categorias_adicionais.id = adicionais.categoria_id
      where adicionais.id = (v_adicional->>'adicional_id')::uuid
        and adicionais.ativo = true;
    end loop;
  end loop;

  return v_pedido_id;
end;
$$;
