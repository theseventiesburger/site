-- Completa o item "Order" do checklist de homologação do UaiRango: exibir
-- bandeira do cartão, troco (pagamento em dinheiro) e cupom de desconto
-- (valor + responsável) — hoje esses dados chegavam no pedido mas eram
-- descartados na hora de gravar. Também resolve produto_id quando o item
-- do pedido já veio com externalCode batendo um produto nosso (depende da
-- sincronização de catálogo — migration 0052 — pra ter algo pra bater).
-- Rode este arquivo inteiro no SQL Editor do Supabase.

alter table pedidos add column uairango_bandeira_cartao text;
alter table pedidos add column uairango_troco numeric(10,2);
alter table pedidos add column uairango_cupom_valor numeric(10,2);
alter table pedidos add column uairango_cupom_responsavel text;

drop function criar_pedido_uairango(text, text, text, text, text, numeric, text, boolean, text, jsonb);

create function criar_pedido_uairango(
  p_uairango_order_id      text,
  p_tipo                   text,
  p_cliente_nome           text,
  p_cliente_telefone       text,
  p_endereco               text,
  p_taxa_entrega           numeric default 0,
  p_forma_pagamento        text default null,
  p_pago                   boolean default true,
  p_observacoes            text default null,
  p_itens                  jsonb default '[]'::jsonb,
  p_bandeira_cartao        text default null,
  p_troco                  numeric default null,
  p_cupom_valor            numeric default null,
  p_cupom_responsavel      text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_pedido_id  uuid;
  v_item       jsonb;
  v_produto_id uuid;
begin
  select id into v_pedido_id from pedidos where uairango_order_id = p_uairango_order_id;
  if v_pedido_id is not null then
    return v_pedido_id;
  end if;

  insert into pedidos (
    tipo, cliente_nome, cliente_telefone, endereco,
    taxa_entrega, forma_pagamento, pago, observacoes, uairango_order_id,
    uairango_bandeira_cartao, uairango_troco, uairango_cupom_valor, uairango_cupom_responsavel
  ) values (
    p_tipo, p_cliente_nome, p_cliente_telefone, p_endereco,
    coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_pago, p_observacoes, p_uairango_order_id,
    p_bandeira_cartao, p_troco, p_cupom_valor, p_cupom_responsavel
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    -- externalCode só bate produto nosso depois que o cardápio for
    -- sincronizado (0052) — até lá, ou pra item sem correspondência,
    -- v_produto_id fica null (mesmo comportamento de antes).
    v_produto_id := null;
    begin
      if v_item->>'externalCode' is not null then
        select id into v_produto_id from produtos where id = (v_item->>'externalCode')::uuid;
      end if;
    exception when others then
      v_produto_id := null;
    end;

    insert into itens_pedido (
      pedido_id, produto_id, nome_produto, preco_unitario, quantidade, observacao, subtotal
    ) values (
      v_pedido_id,
      v_produto_id,
      v_item->>'nome',
      (v_item->>'preco_unitario')::numeric,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao',
      (v_item->>'preco_unitario')::numeric * (v_item->>'quantidade')::smallint
    );
  end loop;

  return v_pedido_id;
end;
$$;

grant execute on function criar_pedido_uairango(
  text, text, text, text, text, numeric, text, boolean, text, jsonb, text, numeric, numeric, text
) to service_role;
