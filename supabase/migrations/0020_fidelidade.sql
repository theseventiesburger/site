-- Fidelidade: 1 ponto por R$1,00 gasto em produtos (com desconto de cupom
-- já aplicado, sem contar taxa de entrega), creditado só quando o pagamento
-- do pedido é confirmado. Rode este arquivo inteiro no SQL Editor do Supabase.

alter table clientes add column pontos_saldo integer not null default 0 check (pontos_saldo >= 0);

-- Snapshot de quantos pontos este pedido específico gerou — permite estornar
-- certinho se o pagamento for desmarcado ou o pedido for cancelado depois
-- de já ter creditado.
alter table pedidos add column pontos_gerados integer not null default 0 check (pontos_gerados >= 0);

create function sincronizar_pontos_fidelidade() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_subtotal       numeric;
  v_pontos         integer;
  v_deve_ter_pontos boolean;
begin
  v_deve_ter_pontos := new.pago and new.status <> 'cancelado';

  if v_deve_ter_pontos and coalesce(old.pontos_gerados, 0) = 0 then
    select coalesce(sum(subtotal), 0) into v_subtotal
    from itens_pedido where pedido_id = new.id;

    v_pontos := floor(greatest(v_subtotal - new.desconto, 0))::integer;
    new.pontos_gerados := v_pontos;

    if new.cliente_id is not null and v_pontos > 0 then
      update clientes set pontos_saldo = pontos_saldo + v_pontos where id = new.cliente_id;
    end if;

  elsif not v_deve_ter_pontos and coalesce(old.pontos_gerados, 0) > 0 then
    if old.cliente_id is not null then
      update clientes set pontos_saldo = greatest(pontos_saldo - old.pontos_gerados, 0) where id = old.cliente_id;
    end if;
    new.pontos_gerados := 0;
  end if;

  return new;
end;
$$;

create trigger pedidos_sincroniza_pontos
  before update on pedidos
  for each row
  when (new.pago is distinct from old.pago or new.status is distinct from old.status)
  execute function sincronizar_pontos_fidelidade();
