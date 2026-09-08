-- Duas coisas que faltavam pro garçom lidar com mesa aberta por engano:
-- 1) Mesa vazia (nada lançado, ou tudo excluído) não deveria precisar do
--    fluxo de "fechar conta" — que exige escolher forma de pagamento.
-- 2) Mesa com lançamento errado (mesa errada, pedido duplicado etc.) precisa
--    poder ser cancelada inteira, não só item por item.
-- A mesma ação resolve as duas: cancela todos os itens ainda não cancelados
-- de todas as rodadas da comanda e fecha ela sem pagamento. Rode este
-- arquivo inteiro no SQL Editor do Supabase.

-- ─── recalcular_status_pedido (0032) tinha um buraco: quando TODOS os itens
-- de uma rodada ficam cancelados, a subquery de status mínimo não acha
-- nenhuma linha e a função simplesmente não mexe em pedidos.status — a
-- rodada ficava travada em 'recebido'/'preparando' pra sempre, continuando
-- a aparecer em Cozinha e Pedidos Abertos mesmo com todo mundo cancelado.
-- Agora cai pra 'cancelado' nesse caso.
create or replace function recalcular_status_pedido() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pedido_id  uuid;
  v_min_status text;
begin
  v_pedido_id := coalesce(new.pedido_id, old.pedido_id);

  select status into v_min_status
  from itens_pedido
  where pedido_id = v_pedido_id and status <> 'cancelado'
  order by array_position(array['recebido','preparando','pronto','entregue'], status)
  limit 1;

  if v_min_status is not null then
    update pedidos set status = v_min_status where id = v_pedido_id and status <> 'cancelado';
  else
    update pedidos set status = 'cancelado' where id = v_pedido_id and status <> 'cancelado';
  end if;

  return coalesce(new, old);
end;
$$;

-- ─── cancelar_comanda: cancela tudo e fecha sem forma de pagamento. O
-- update em itens_pedido já dispara sozinho (via triggers existentes):
-- recalcular_status_pedido (cancela a rodada quando some o último item
-- ativo, ver acima), pedidos_estorna_estoque_cancelado (devolve o estoque
-- baixado) e os dois recalcular_total_* (total some).
create function cancelar_comanda(p_comanda_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode cancelar a mesa.';
  end if;

  if not exists (select 1 from comandas where id = p_comanda_id and status = 'aberta') then
    raise exception 'Comanda não encontrada ou já fechada.';
  end if;

  update itens_pedido
  set status = 'cancelado'
  where status <> 'cancelado'
    and pedido_id in (select id from pedidos where comanda_id = p_comanda_id);

  update comandas
  set status = 'fechada', fechada_em = now(), forma_pagamento = null
  where id = p_comanda_id;
end;
$$;

grant execute on function cancelar_comanda(uuid) to authenticated;
