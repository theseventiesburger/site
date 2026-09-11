-- Delivery/PDV/retirada ganham o mesmo "ajustar valor antes de fechar" que
-- mesa já tinha (fechar_comanda, 0037) — cortesia por item e reescrita de
-- preço, não só forma de pagamento. Rode este arquivo inteiro no SQL
-- Editor do Supabase.

-- ─── bug encontrado no caminho: itens_pedido.subtotal deixou de ser coluna
-- gerada faz tempo (0006c, pra poder somar adicional junto) e desde então
-- nada recalcula ela quando preco_unitario muda depois de criado. Isso já
-- valia pra fechar_comanda (0037): editar o preço de um item no fechamento
-- da mesa atualizava preco_unitario, mas subtotal ficava com o valor
-- antigo — e é subtotal que os triggers de total somam. A tela de fechar
-- conta mostrava o valor certo (calculado no navegador), mas o que ficava
-- gravado no banco (pedidos.total/comandas.total, usado em relatório) não
-- refletia o ajuste. Sem isso, fechar_pedido (abaixo) teria o mesmo furo.
create function atualizar_subtotal_item_pedido() returns trigger
language plpgsql as $$
begin
  new.subtotal := new.preco_unitario * new.quantidade;
  return new;
end;
$$;

create trigger itens_pedido_atualiza_subtotal
  before update of preco_unitario, quantidade on itens_pedido
  for each row execute function atualizar_subtotal_item_pedido();

-- ─── fechar_pedido: equivalente a fechar_comanda, mas pra pedido avulso
-- (delivery/pdv/retirada) — mesa sempre fecha pela comanda, nunca por
-- aqui. Marca pago=true; forma_pagamento e itens ficam registrados do
-- jeito que o atendente ajustou na hora de fechar.
create function fechar_pedido(
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

  update pedidos
  set
    desconto        = coalesce(p_desconto, desconto),
    forma_pagamento = p_forma_pagamento,
    pago            = true
  where id = p_pedido_id;
end;
$$;

grant execute on function fechar_pedido(uuid, text, numeric, uuid[], jsonb) to authenticated;
