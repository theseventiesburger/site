-- Permite ajustar o preço unitário de itens já lançados no momento de
-- fechar a conta da mesa — usado quando a venda saiu por um app de entrega
-- (iFood, Rappi etc.) que cobra comissão/taxa e o valor repassado ao
-- cliente precisa ficar maior que o preço de cardápio. Reaproveita
-- fechar_comanda: dropa a assinatura antiga (0030) e recria com o
-- parâmetro novo, mesmo motivo do 0028 (overload fantasma em vez de
-- substituir a função quando a aridade muda).

drop function if exists fechar_comanda(uuid, text, numeric, numeric, uuid[]);

create function fechar_comanda(
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

  -- Cada item só é atualizado se pertencer a um pedido desta comanda — trava
  -- que impede o staff de reescrever preço de item de outra mesa passando o
  -- id errado. O trigger itens_pedido_recalcula_total_comanda já recalcula
  -- subtotal/total sozinho (subtotal é coluna gerada a partir de
  -- preco_unitario * quantidade).
  if p_itens_precos is not null then
    for v_item in select * from jsonb_array_elements(p_itens_precos)
    loop
      update itens_pedido
      set preco_unitario = (v_item->>'preco_unitario')::numeric
      where id = (v_item->>'id')::uuid
        and pedido_id in (select id from pedidos where comanda_id = p_comanda_id);
    end loop;
  end if;

  update comandas
  set
    taxa_servico    = coalesce(p_taxa_servico, taxa_servico),
    desconto        = coalesce(p_desconto, desconto),
    forma_pagamento = p_forma_pagamento,
    status          = 'fechada',
    fechada_em      = now()
  where id = p_comanda_id;
end;
$$;

grant execute on function fechar_comanda(uuid, text, numeric, numeric, uuid[], jsonb) to authenticated;
