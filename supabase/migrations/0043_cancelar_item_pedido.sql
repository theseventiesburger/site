-- Garçom precisa poder excluir um item já lançado na mesa quando a cozinha
-- avisa que acabou o insumo (o item já foi lançado, mas nunca vai ser
-- atendido). O status 'cancelado' em itens_pedido já existe desde a 0032
-- (pensado pra isso), mas os totais (do pedido e da comanda) ainda somavam
-- esses itens — só filtravam cortesia. Ajusta as três funções de total
-- (mesma lógica da 0027/0030) pra excluir também os itens cancelados. Rode
-- este arquivo inteiro no SQL Editor do Supabase.

create or replace function recalcular_total_pedido() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pedido_id uuid;
begin
  v_pedido_id := coalesce(new.pedido_id, old.pedido_id);

  update pedidos
  set total = (
    select coalesce(sum(subtotal) filter (where not cortesia and status <> 'cancelado'), 0)
    from itens_pedido
    where pedido_id = v_pedido_id
  ) + taxa_entrega + taxa_servico - desconto
  where id = v_pedido_id;

  return coalesce(new, old);
end;
$$;

create or replace function recalcular_total_por_taxa() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update pedidos
  set total = (
    select coalesce(sum(subtotal) filter (where not cortesia and status <> 'cancelado'), 0)
    from itens_pedido
    where pedido_id = new.id
  ) + new.taxa_entrega + new.taxa_servico - new.desconto
  where id = new.id;

  return new;
end;
$$;

create or replace function recalcular_total_comanda() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_comanda_id uuid;
begin
  select comanda_id into v_comanda_id
  from pedidos
  where id = coalesce(new.pedido_id, old.pedido_id);

  if v_comanda_id is not null then
    update comandas
    set total = (
      select coalesce(sum(ip.subtotal) filter (where not ip.cortesia and ip.status <> 'cancelado'), 0)
      from itens_pedido ip
      join pedidos p on p.id = ip.pedido_id
      where p.comanda_id = v_comanda_id
    ) + taxa_servico - desconto
    where id = v_comanda_id;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function recalcular_total_comanda_por_taxa() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update comandas
  set total = (
    select coalesce(sum(ip.subtotal) filter (where not ip.cortesia and ip.status <> 'cancelado'), 0)
    from itens_pedido ip
    join pedidos p on p.id = ip.pedido_id
    where p.comanda_id = new.id
  ) + new.taxa_servico - new.desconto
  where id = new.id;

  return new;
end;
$$;
