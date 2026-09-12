-- Achado ao conferir o badge novo de Pago/Pendente no relatório: fechar
-- mesa/pedido marcava pago=true sempre, sem importar a forma de pagamento
-- escolhida — inclusive quando era "Fiado" (venda a prazo, dinheiro não
-- entrou ainda). Corrige fechar_comanda e fechar_pedido pra só marcar
-- pago quando a forma não for fiado, e um backfill pro que já fechou
-- errado antes disso. Rode este arquivo inteiro no SQL Editor do Supabase.

create or replace function fechar_comanda(
  p_comanda_id      uuid,
  p_forma_pagamento text,
  p_taxa_servico    numeric default null,
  p_desconto        numeric default null,
  p_itens_cortesia  uuid[] default null,
  p_itens_precos    jsonb default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb;
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode fechar a conta.';
  end if;

  if p_itens_cortesia is not null then
    update itens_pedido
    set cortesia = (id = any(p_itens_cortesia))
    where pedido_id in (select id from pedidos where comanda_id = p_comanda_id);
  end if;

  if p_itens_precos is not null then
    for v_item in select * from jsonb_array_elements(p_itens_precos)
    loop
      update itens_pedido
      set preco_unitario = (v_item->>'preco_unitario')::numeric
      where id = (v_item->>'id')::uuid
        and pedido_id in (select id from pedidos where comanda_id = p_comanda_id);
    end loop;
  end if;

  update itens_pedido
  set status = 'entregue'
  where status not in ('entregue', 'cancelado')
    and pedido_id in (select id from pedidos where comanda_id = p_comanda_id);

  update comandas
  set
    taxa_servico    = coalesce(p_taxa_servico, taxa_servico),
    desconto        = coalesce(p_desconto, desconto),
    forma_pagamento = p_forma_pagamento,
    status          = 'fechada',
    fechada_em      = now()
  where id = p_comanda_id;

  update pedidos
  set forma_pagamento = p_forma_pagamento, pago = (p_forma_pagamento is distinct from 'fiado')
  where comanda_id = p_comanda_id;
end;
$$;

create or replace function fechar_pedido(
  p_pedido_id       uuid,
  p_forma_pagamento text,
  p_desconto        numeric default null,
  p_itens_cortesia  uuid[] default null,
  p_itens_precos    jsonb default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb;
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode confirmar o pagamento.';
  end if;

  if not exists (select 1 from pedidos where id = p_pedido_id and tipo <> 'mesa') then
    raise exception 'Pedido não encontrado (mesa fecha pela comanda, não por aqui).';
  end if;

  if p_itens_cortesia is not null then
    update itens_pedido
    set cortesia = (id = any(p_itens_cortesia))
    where pedido_id = p_pedido_id;
  end if;

  if p_itens_precos is not null then
    for v_item in select * from jsonb_array_elements(p_itens_precos)
    loop
      update itens_pedido
      set preco_unitario = (v_item->>'preco_unitario')::numeric
      where id = (v_item->>'id')::uuid
        and pedido_id = p_pedido_id;
    end loop;
  end if;

  update itens_pedido
  set status = 'entregue'
  where status not in ('entregue', 'cancelado')
    and pedido_id = p_pedido_id;

  update pedidos
  set
    desconto        = coalesce(p_desconto, desconto),
    forma_pagamento = p_forma_pagamento,
    pago            = (p_forma_pagamento is distinct from 'fiado')
  where id = p_pedido_id;
end;
$$;

-- ─── backfill: pedido fiado que já foi marcado pago por engano antes
-- desse conserto (exclui órfão de mesa sem comanda — mesmo motivo das
-- migrations anteriores).
update pedidos
set pago = false
where forma_pagamento = 'fiado'
  and pago = true
  and (tipo <> 'mesa' or comanda_id is not null);
