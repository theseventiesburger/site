-- Controle de estoque de insumos (matéria-prima), com ficha técnica por
-- produto e por adicional: cadastra quanto cada um consome de cada insumo,
-- e a baixa acontece sozinha quando o pedido é criado (com estorno se o
-- pedido for cancelado depois). Rode este arquivo inteiro no SQL Editor do
-- Supabase.

-- ─── insumos ────────────────────────────────────────────────────────────────
create table insumos (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  unidade        text not null, -- 'un', 'fatia', 'g', 'kg', 'ml', 'L' etc — texto livre
  estoque_atual  numeric(12,3) not null default 0,
  estoque_minimo numeric(12,3) not null default 0 check (estoque_minimo >= 0),
  ativo          boolean not null default true,
  created_at     timestamptz not null default now()
);

create index insumos_nome_idx on insumos (nome);

alter table insumos enable row level security;

create policy insumos_select on insumos for select to authenticated using (true);
create policy insumos_insert on insumos for insert to authenticated with check (true);
create policy insumos_update on insumos for update to authenticated using (true) with check (true);

-- ─── receita_itens (ficha técnica) ─────────────────────────────────────────
-- Cada linha diz "esse produto (ou esse adicional) consome X unidades desse
-- insumo por unidade vendida". Uma linha é de produto OU de adicional, nunca
-- os dois.
create table receita_itens (
  id           uuid primary key default gen_random_uuid(),
  produto_id   uuid references produtos(id) on delete cascade,
  adicional_id uuid references adicionais(id) on delete cascade,
  insumo_id    uuid not null references insumos(id) on delete restrict,
  quantidade   numeric(12,3) not null check (quantidade > 0),
  created_at   timestamptz not null default now(),

  constraint receita_um_vinculo check (
    (produto_id is not null and adicional_id is null) or
    (produto_id is null and adicional_id is not null)
  )
);

create unique index receita_produto_insumo_unq on receita_itens (produto_id, insumo_id) where produto_id is not null;
create unique index receita_adicional_insumo_unq on receita_itens (adicional_id, insumo_id) where adicional_id is not null;

alter table receita_itens enable row level security;

create policy receita_itens_select on receita_itens for select to authenticated using (true);
create policy receita_itens_insert on receita_itens for insert to authenticated with check (true);
create policy receita_itens_update on receita_itens for update to authenticated using (true) with check (true);
create policy receita_itens_delete on receita_itens for delete to authenticated using (true);

-- ─── movimentos_estoque (ledger) ───────────────────────────────────────────
-- Append-only: sem policy de insert/update/delete pra "authenticated" — só
-- se escreve aqui via registrar_movimento_estoque() ou pelos triggers de
-- baixa/estorno automáticos abaixo, todos security definer.
create table movimentos_estoque (
  id            bigint generated always as identity primary key,
  insumo_id     uuid not null references insumos(id) on delete cascade,
  quantidade    numeric(12,3) not null, -- delta assinado: entrada > 0, saída < 0
  tipo          text not null check (tipo in ('entrada', 'saida', 'ajuste')),
  motivo        text,
  pedido_id     uuid references pedidos(id) on delete set null,
  usuario_id    uuid references auth.users(id) on delete set null,
  usuario_email text,
  created_at    timestamptz not null default now()
);

create index movimentos_estoque_insumo_idx on movimentos_estoque (insumo_id, created_at desc);
create index movimentos_estoque_pedido_idx on movimentos_estoque (pedido_id);

alter table movimentos_estoque enable row level security;

create policy movimentos_estoque_select on movimentos_estoque for select to authenticated using (true);

-- Entrada de compra / ajuste manual — usado pela tela de Estoque. Debita ou
-- credita o insumo e grava o motivo, tudo numa transação só.
create function registrar_movimento_estoque(
  p_insumo_id uuid,
  p_quantidade numeric,
  p_tipo text,
  p_motivo text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text;
begin
  select email into v_email from auth.users where id = auth.uid();

  insert into movimentos_estoque (insumo_id, quantidade, tipo, motivo, usuario_id, usuario_email)
  values (p_insumo_id, p_quantidade, p_tipo, p_motivo, auth.uid(), v_email);

  update insumos set estoque_atual = estoque_atual + p_quantidade where id = p_insumo_id;
end;
$$;

-- ─── baixa automática por produto ──────────────────────────────────────────
create function debitar_estoque_item() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_email text;
begin
  select email into v_email from auth.users where id = auth.uid();

  for r in
    select insumo_id, quantidade * new.quantidade as total
    from receita_itens
    where produto_id = new.produto_id
  loop
    insert into movimentos_estoque (insumo_id, quantidade, tipo, motivo, pedido_id, usuario_id, usuario_email)
    values (r.insumo_id, -r.total, 'saida', 'Baixa automática de pedido', new.pedido_id, auth.uid(), v_email);

    update insumos set estoque_atual = estoque_atual - r.total where id = r.insumo_id;
  end loop;

  return new;
end;
$$;

create trigger itens_pedido_debita_estoque
  after insert on itens_pedido
  for each row execute function debitar_estoque_item();

-- ─── baixa automática por adicional ────────────────────────────────────────
-- itens_pedido_adicionais só guardava nome/preço (snapshot da venda) — sem
-- adicional_id não dá pra achar a ficha técnica, então a coluna entra aqui.
alter table itens_pedido_adicionais add column adicional_id uuid references adicionais(id) on delete set null;

create function debitar_estoque_adicional() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_pedido_id uuid;
  v_quantidade smallint;
  v_email text;
begin
  if new.adicional_id is null then
    return new;
  end if;

  select pedido_id, quantidade into v_pedido_id, v_quantidade
  from itens_pedido where id = new.item_pedido_id;

  select email into v_email from auth.users where id = auth.uid();

  for r in
    select insumo_id, quantidade * v_quantidade as total
    from receita_itens
    where adicional_id = new.adicional_id
  loop
    insert into movimentos_estoque (insumo_id, quantidade, tipo, motivo, pedido_id, usuario_id, usuario_email)
    values (r.insumo_id, -r.total, 'saida', 'Baixa automática de pedido (adicional)', v_pedido_id, auth.uid(), v_email);

    update insumos set estoque_atual = estoque_atual - r.total where id = r.insumo_id;
  end loop;

  return new;
end;
$$;

create trigger itens_pedido_adicionais_debita_estoque
  after insert on itens_pedido_adicionais
  for each row execute function debitar_estoque_adicional();

-- ─── criar_pedido: passa a gravar o adicional_id junto do snapshot ────────
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
      insert into itens_pedido_adicionais (item_pedido_id, nome_adicional, preco_adicional, adicional_id)
      select
        v_item_pedido_id,
        adicionais.nome,
        case
          when p_tipo = any(coalesce(categorias_adicionais.gratuita_tipos, '{}')) then 0
          else adicionais.preco
        end,
        adicionais.id
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

-- ─── estorno automático quando o pedido é cancelado ───────────────────────
create function estornar_estoque_pedido_cancelado() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_email text;
begin
  select email into v_email from auth.users where id = auth.uid();

  for r in
    select insumo_id, sum(quantidade) as total
    from movimentos_estoque
    where pedido_id = new.id and tipo = 'saida' and motivo like 'Baixa automática%'
    group by insumo_id
  loop
    insert into movimentos_estoque (insumo_id, quantidade, tipo, motivo, pedido_id, usuario_id, usuario_email)
    values (r.insumo_id, -r.total, 'entrada', 'Estorno de pedido cancelado', new.id, auth.uid(), v_email);

    update insumos set estoque_atual = estoque_atual - r.total where id = r.insumo_id;
  end loop;

  return new;
end;
$$;

create trigger pedidos_estorna_estoque_cancelado
  after update of status on pedidos
  for each row
  when (new.status = 'cancelado' and old.status is distinct from 'cancelado')
  execute function estornar_estoque_pedido_cancelado();

-- ─── auditoria (reaproveita o trigger genérico de 0019) ───────────────────
create trigger insumos_auditoria
  after insert or update or delete on insumos
  for each row execute function registrar_auditoria();

create trigger receita_itens_auditoria
  after insert or update or delete on receita_itens
  for each row execute function registrar_auditoria();
