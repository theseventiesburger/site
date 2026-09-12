-- Achado no relatório: pedido #133 ficava com badge "Recebido" (cozinha
-- nunca avançou pra Entregue) mesmo com a mesa já fechada e paga há tempo —
-- fechar_comanda/fechar_pedido nunca forçavam os itens ainda pendentes a
-- "entregue". Se o garçom fecha a conta e o cliente vai embora, a comida
-- foi servida — não importa se alguém esqueceu de clicar nas colunas da
-- Cozinha antes. Sem isso, a rodada fica com status errado pra sempre
-- (a Cozinha nem mostra mais, já saiu da lista de abertos, mas o relatório
-- mostra o badge trocado). Rode este arquivo inteiro no SQL Editor do
-- Supabase.

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

  -- Fecha a conta: comida já foi servida, então nenhuma rodada deveria
  -- continuar "recebido/preparando/pronto" — recalcular_status_pedido
  -- (0032/0044) já cuida de levar isso pro pedido sozinho.
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
  set forma_pagamento = p_forma_pagamento, pago = true
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
    pago            = true
  where id = p_pedido_id;
end;
$$;

-- ─── backfill: pedido já pago/fechado antes deste conserto, mas com item
-- preso em recebido/preparando/pronto. Exclui pedido de mesa órfão de
-- comanda (de antes da 0030 existir) — mesmo motivo do backfill da 0032:
-- tocar nele dispara o recálculo de status, que esbarra na constraint
-- comanda_obrigatoria (exige comanda_id pra tipo='mesa'), que essas linhas
-- antigas não cumprem e nunca vão cumprir.
update itens_pedido ip
set status = 'entregue'
where ip.status not in ('entregue', 'cancelado')
  and ip.pedido_id in (
    select p.id from pedidos p
    left join comandas c on c.id = p.comanda_id
    where (p.pago = true or c.status = 'fechada')
      and (p.tipo <> 'mesa' or p.comanda_id is not null)
  );
