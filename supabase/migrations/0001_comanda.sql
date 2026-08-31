-- Comanda Eletrônica — schema inicial
-- Rode este arquivo inteiro no SQL Editor do Supabase, depois rode
-- supabase/seed/0002_produtos_mesas.sql.

-- ─── produtos ──────────────────────────────────────────────────────────────
create table produtos (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  nome       text not null,
  descricao  text,
  preco      numeric(10,2) not null check (preco >= 0),
  imagem     text not null default '/hb2.png',
  tag        text,
  categoria  text not null check (categoria in ('especiais','classicos','combos','bebidas','sobremesas')),
  ativo      boolean not null default true,
  ordem      smallint not null default 0,
  created_at timestamptz not null default now()
);

-- ─── mesas ─────────────────────────────────────────────────────────────────
create table mesas (
  numero  smallint primary key,
  apelido text,
  ativa   boolean not null default true
);

-- ─── pedidos ───────────────────────────────────────────────────────────────
create table pedidos (
  id               uuid primary key default gen_random_uuid(),
  numero           bigint generated always as identity,
  tipo             text not null check (tipo in ('mesa','delivery','pdv')),
  status           text not null default 'recebido' check (status in ('recebido','preparando','pronto','entregue','cancelado')),
  mesa_id          smallint references mesas(numero) on delete restrict,
  cliente_nome     text,
  cliente_telefone text,
  endereco         text,
  taxa_entrega     numeric(10,2) not null default 0 check (taxa_entrega >= 0),
  forma_pagamento  text check (forma_pagamento in ('dinheiro','pix','credito','debito','online')),
  pago             boolean not null default false,
  observacoes      text,
  total            numeric(10,2) not null default 0,
  criado_por       uuid references auth.users(id) on delete set null default auth.uid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint mesa_obrigatoria check (
    (tipo = 'mesa' and mesa_id is not null) or
    (tipo <> 'mesa' and mesa_id is null)
  ),
  constraint entrega_obrigatoria check (
    tipo <> 'delivery' or (endereco is not null and cliente_nome is not null)
  ),
  constraint taxa_apenas_delivery check (
    tipo = 'delivery' or taxa_entrega = 0
  )
);

create index pedidos_abertos_idx on pedidos (created_at desc) where status not in ('entregue','cancelado');
create index pedidos_created_at_idx on pedidos (created_at desc);
create index pedidos_tipo_status_idx on pedidos (tipo, status);

-- ─── itens_pedido ──────────────────────────────────────────────────────────
create table itens_pedido (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references pedidos(id) on delete cascade,
  produto_id      uuid not null references produtos(id) on delete restrict,
  nome_produto    text not null,
  preco_unitario  numeric(10,2) not null check (preco_unitario >= 0),
  quantidade      smallint not null check (quantidade > 0),
  observacao      text,
  subtotal        numeric(10,2) generated always as (preco_unitario * quantidade) stored,
  created_at      timestamptz not null default now()
);

create index itens_pedido_pedido_id_idx on itens_pedido (pedido_id);

-- ─── triggers: updated_at e total do pedido ───────────────────────────────
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pedidos_set_updated_at
  before update on pedidos
  for each row execute function set_updated_at();

create function recalcular_total_pedido() returns trigger
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
  ) + taxa_entrega
  where id = v_pedido_id;

  return coalesce(new, old);
end;
$$;

create trigger itens_pedido_recalcula_total
  after insert or update or delete on itens_pedido
  for each row execute function recalcular_total_pedido();

create function recalcular_total_por_taxa() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update pedidos
  set total = (
    select coalesce(sum(subtotal), 0)
    from itens_pedido
    where pedido_id = new.id
  ) + new.taxa_entrega
  where id = new.id;

  return new;
end;
$$;

create trigger pedidos_recalcula_total_por_taxa
  after update of taxa_entrega on pedidos
  for each row execute function recalcular_total_por_taxa();

-- ─── RPC: criar_pedido ─────────────────────────────────────────────────────
-- Cria o pedido e todos os itens numa única transação, relendo preço/nome
-- direto de `produtos` no servidor (nunca confia no que o navegador mandou).
create function criar_pedido(
  p_tipo             text,
  p_mesa             smallint default null,
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
  v_pedido_id uuid;
  v_item jsonb;
begin
  insert into pedidos (
    tipo, mesa_id, cliente_nome, cliente_telefone, endereco,
    taxa_entrega, forma_pagamento, observacoes
  ) values (
    p_tipo, p_mesa, p_cliente_nome, p_cliente_telefone, p_endereco,
    coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    insert into itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade, observacao)
    select
      v_pedido_id,
      produtos.id,
      produtos.nome,
      produtos.preco,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao'
    from produtos
    where produtos.id = (v_item->>'produto_id')::uuid;
  end loop;

  return v_pedido_id;
end;
$$;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table produtos     enable row level security;
alter table mesas        enable row level security;
alter table pedidos      enable row level security;
alter table itens_pedido enable row level security;

create policy produtos_select on produtos for select to authenticated using (true);
create policy mesas_select    on mesas    for select to authenticated using (true);

create policy pedidos_select on pedidos for select to authenticated using (true);
create policy pedidos_insert on pedidos for insert to authenticated with check (true);
create policy pedidos_update on pedidos for update to authenticated using (true) with check (true);

create policy itens_pedido_select on itens_pedido for select to authenticated using (true);
create policy itens_pedido_insert on itens_pedido for insert to authenticated with check (true);

-- ─── Realtime ───────────────────────────────────────────────────────────────
alter publication supabase_realtime add table pedidos;
alter table pedidos replica identity full;
