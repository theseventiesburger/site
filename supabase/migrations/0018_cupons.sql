-- Cupons de desconto (percentual ou valor fixo) aplicados na hora de criar
-- o pedido — o atendente digita o código, o servidor valida e aplica.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

create table cupons (
  id                   uuid primary key default gen_random_uuid(),
  codigo               text not null unique,
  descricao            text,
  tipo_desconto        text not null check (tipo_desconto in ('percentual', 'fixo')),
  valor                numeric(10,2) not null check (valor > 0),
  valor_minimo_pedido  numeric(10,2) not null default 0 check (valor_minimo_pedido >= 0),
  valido_de            date,
  valido_ate           date,
  limite_uso           integer check (limite_uso is null or limite_uso > 0),
  usos_realizados      integer not null default 0,
  ativo                boolean not null default true,
  created_at           timestamptz not null default now(),

  constraint percentual_maximo check (tipo_desconto <> 'percentual' or valor <= 100)
);

alter table cupons enable row level security;

create policy cupons_select_publico on cupons for select to anon using (ativo = true);
create policy cupons_select on cupons for select to authenticated using (true);
create policy cupons_insert on cupons for insert to authenticated with check (true);
create policy cupons_update on cupons for update to authenticated using (true) with check (true);

-- Snapshot no pedido: se o cupom mudar de valor depois, o pedido já feito
-- não muda retroativamente.
alter table pedidos add column cupom_id uuid references cupons(id) on delete set null;
alter table pedidos add column desconto numeric(10,2) not null default 0 check (desconto >= 0);
alter table pedidos add constraint total_nao_negativo check (total >= 0);

-- ─── total do pedido passa a descontar o cupom também ─────────────────────
create or replace function recalcular_total_pedido() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pedido_id uuid;
begin
  v_pedido_id := coalesce(new.pedido_id, old.pedido_id);

  update pedidos
  set total = (
    select coalesce(sum(subtotal), 0)
    from itens_pedido
    where pedido_id = v_pedido_id
  ) + taxa_entrega - desconto
  where id = v_pedido_id;

  return coalesce(new, old);
end;
$$;

create or replace function recalcular_total_por_taxa() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update pedidos
  set total = (
    select coalesce(sum(subtotal), 0)
    from itens_pedido
    where pedido_id = new.id
  ) + new.taxa_entrega - new.desconto
  where id = new.id;

  return new;
end;
$$;

drop trigger pedidos_recalcula_total_por_taxa on pedidos;
create trigger pedidos_recalcula_total_por_taxa
  after update of taxa_entrega, desconto on pedidos
  for each row execute function recalcular_total_por_taxa();

-- ─── criar_pedido: aceita um código de cupom opcional ─────────────────────
create or replace function criar_pedido(
  p_tipo             text,
  p_mesa             smallint default null,
  p_cliente_id       uuid default null,
  p_cliente_nome     text default null,
  p_cliente_telefone text default null,
  p_endereco         text default null,
  p_bairro_id        uuid default null,
  p_cidade           text default null,
  p_estado           text default null,
  p_ponto_referencia text default null,
  p_taxa_entrega     numeric default 0,
  p_forma_pagamento  text default null,
  p_observacoes      text default null,
  p_cupom_codigo     text default null,
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
  v_subtotal_item   numeric;
  v_subtotal_itens  numeric := 0;
  v_cupom           cupons%rowtype;
  v_desconto        numeric := 0;
begin
  if p_cupom_codigo is not null then
    select * into v_cupom from cupons where upper(codigo) = upper(p_cupom_codigo);

    if v_cupom.id is null then
      raise exception 'Cupom "%" não encontrado.', p_cupom_codigo;
    end if;
    if not v_cupom.ativo then
      raise exception 'Cupom "%" está inativo.', p_cupom_codigo;
    end if;
    if v_cupom.valido_de is not null and current_date < v_cupom.valido_de then
      raise exception 'Cupom "%" ainda não é válido.', p_cupom_codigo;
    end if;
    if v_cupom.valido_ate is not null and current_date > v_cupom.valido_ate then
      raise exception 'Cupom "%" está expirado.', p_cupom_codigo;
    end if;
    if v_cupom.limite_uso is not null and v_cupom.usos_realizados >= v_cupom.limite_uso then
      raise exception 'Cupom "%" atingiu o limite de usos.', p_cupom_codigo;
    end if;
  end if;

  insert into pedidos (
    tipo, mesa_id, cliente_id, cliente_nome, cliente_telefone, endereco,
    bairro_id, cidade, estado, ponto_referencia,
    taxa_entrega, forma_pagamento, observacoes
  ) values (
    p_tipo, p_mesa, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
    p_bairro_id, p_cidade, p_estado, p_ponto_referencia,
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

    insert into itens_pedido (
      pedido_id, produto_id, nome_produto, preco_unitario, quantidade,
      observacao, ponto_carne, subtotal
    )
    select
      v_pedido_id,
      produtos.id,
      produtos.nome,
      produtos.preco,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao',
      v_item->>'ponto_carne',
      (produtos.preco + v_soma_adicionais) * (v_item->>'quantidade')::smallint
    from produtos
    where produtos.id = v_produto_id
    returning id, subtotal into v_item_pedido_id, v_subtotal_item;

    v_subtotal_itens := v_subtotal_itens + coalesce(v_subtotal_item, 0);

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

  if v_cupom.id is not null then
    if v_subtotal_itens < v_cupom.valor_minimo_pedido then
      raise exception 'Pedido mínimo de % para usar o cupom "%".', v_cupom.valor_minimo_pedido, p_cupom_codigo;
    end if;

    v_desconto := case
      when v_cupom.tipo_desconto = 'percentual' then round(v_subtotal_itens * v_cupom.valor / 100, 2)
      else least(v_cupom.valor, v_subtotal_itens + coalesce(p_taxa_entrega, 0))
    end;

    update pedidos set cupom_id = v_cupom.id, desconto = v_desconto where id = v_pedido_id;
    update cupons set usos_realizados = usos_realizados + 1 where id = v_cupom.id;
  end if;

  return v_pedido_id;
end;
$$;
