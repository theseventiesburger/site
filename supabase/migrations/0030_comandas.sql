-- Comanda de mesa como "conta aberta": até aqui, cada rodada de itens numa
-- mesa era um `pedido` isolado, com pagamento próprio exigido antes de virar
-- "entregue" na Cozinha — então uma mesa com várias rodadas (ex: mais uma
-- cerveja depois) virava vários pedidos separados, e fechar a conta exigia
-- somar tudo na mão. Esta migration separa as duas coisas: `pedidos`
-- continua sendo a ficha que vai pra Cozinha (uma por rodada, sem trava de
-- pagamento pra mesa), e a nova `comandas` é a conta corrente da mesa —
-- agrupa todas as rodadas e só fecha (com pagamento) uma vez, somando tudo
-- sozinha. Rode este arquivo inteiro no SQL Editor do Supabase.

-- ─── comandas ──────────────────────────────────────────────────────────────
create table comandas (
  id              uuid primary key default gen_random_uuid(),
  mesa_id         smallint not null references mesas(numero) on delete restrict,
  status          text not null default 'aberta' check (status in ('aberta','fechada')),
  taxa_servico    numeric(10,2) not null default 0 check (taxa_servico >= 0),
  desconto        numeric(10,2) not null default 0 check (desconto >= 0),
  forma_pagamento text check (forma_pagamento in ('dinheiro','pix','credito','debito','online','vale_refeicao','fiado')),
  total           numeric(10,2) not null default 0,
  criado_por      uuid references auth.users(id) on delete set null default auth.uid(),
  aberta_em       timestamptz not null default now(),
  fechada_em      timestamptz
);

-- Nunca duas comandas abertas na mesma mesa ao mesmo tempo.
create unique index comandas_mesa_aberta_idx on comandas (mesa_id) where status = 'aberta';

alter table pedidos add column comanda_id uuid references comandas(id) on delete restrict;

-- "not valid": pedidos antigos de mesa (já entregues/pagos, de antes dessa
-- migration) não têm comanda_id e nunca vão ter — não dá pra inventar uma
-- comanda pra eles agora. "not valid" pula a validação do que já existe e
-- só passa a exigir a regra em pedidos novos daqui pra frente.
alter table pedidos add constraint comanda_obrigatoria check (
  (tipo = 'mesa' and comanda_id is not null) or
  (tipo <> 'mesa' and comanda_id is null)
) not valid;

-- ─── total da comanda: soma o subtotal (exceto cortesia) de todos os itens
-- de todos os pedidos vinculados a ela, mais a taxa de serviço, menos o
-- desconto — mesma lógica de `recalcular_total_pedido`, só que agregada.
create function recalcular_total_comanda() returns trigger
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
      select coalesce(sum(ip.subtotal) filter (where not ip.cortesia), 0)
      from itens_pedido ip
      join pedidos p on p.id = ip.pedido_id
      where p.comanda_id = v_comanda_id
    ) + taxa_servico - desconto
    where id = v_comanda_id;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger itens_pedido_recalcula_total_comanda
  after insert or update or delete on itens_pedido
  for each row execute function recalcular_total_comanda();

create function recalcular_total_comanda_por_taxa() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update comandas
  set total = (
    select coalesce(sum(ip.subtotal) filter (where not ip.cortesia), 0)
    from itens_pedido ip
    join pedidos p on p.id = ip.pedido_id
    where p.comanda_id = new.id
  ) + new.taxa_servico - new.desconto
  where id = new.id;

  return new;
end;
$$;

create trigger comandas_recalcula_total_por_taxa
  after update of taxa_servico, desconto on comandas
  for each row execute function recalcular_total_comanda_por_taxa();

-- ─── abrir_comanda: idempotente — se a mesa já tem comanda aberta, devolve
-- ela; senão abre uma nova. O índice único acima resolve a corrida de dois
-- garçons abrindo a mesma mesa ao mesmo tempo.
create function abrir_comanda(p_mesa smallint) returns uuid
language plpgsql security invoker as $$
declare
  v_id uuid;
begin
  select id into v_id from comandas where mesa_id = p_mesa and status = 'aberta';
  if v_id is not null then
    return v_id;
  end if;

  insert into comandas (mesa_id) values (p_mesa)
  on conflict (mesa_id) where (status = 'aberta') do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from comandas where mesa_id = p_mesa and status = 'aberta';
  end if;

  return v_id;
end;
$$;

grant execute on function abrir_comanda(smallint) to authenticated;

-- ─── criar_pedido: ganha p_comanda_id. Isso muda a aridade da função — a
-- 0028 já documentou que "create or replace" com assinatura diferente cria
-- um overload fantasma em vez de substituir a antiga. Por isso o drop
-- explícito da assinatura atual (a de 0027_taxa_servico_cortesia.sql) antes
-- de recriar.
drop function if exists criar_pedido(text, smallint, uuid, text, text, text, uuid, text, text, text, numeric, text, text, text, jsonb);

create function criar_pedido(
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
  p_itens            jsonb default '[]'::jsonb,
  p_comanda_id       uuid default null
) returns uuid
language plpgsql security invoker as $$
declare
  v_pedido_id       uuid;
  v_mesa_id         smallint;
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
  if p_tipo = 'mesa' then
    select mesa_id into v_mesa_id from comandas where id = p_comanda_id and status = 'aberta';
    if v_mesa_id is null then
      raise exception 'Comanda não encontrada ou já fechada.';
    end if;
  end if;

  if p_cupom_codigo is not null then
    -- "for update" trava a linha até o fim da transação: dois pedidos
    -- concorrentes não conseguem mais passar do limite de uso ao mesmo
    -- tempo (segundo espera o primeiro terminar de incrementar).
    select * into v_cupom from cupons where upper(codigo) = upper(p_cupom_codigo) for update;

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
    tipo, mesa_id, comanda_id, cliente_id, cliente_nome, cliente_telefone, endereco,
    bairro_id, cidade, estado, ponto_referencia,
    taxa_entrega, forma_pagamento, observacoes
  ) values (
    p_tipo, v_mesa_id, p_comanda_id, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
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

    if not found then
      raise exception 'Produto não encontrado ou indisponível.';
    end if;

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

-- ─── fechar_comanda: fecha a conta da mesa inteira numa transação só —
-- aplica cortesia nos itens escolhidos (de qualquer rodada da comanda),
-- ajusta taxa de serviço e desconto (se informados) e registra o
-- pagamento. Espelha fechar_conta_pedido, mas agregado por comanda.
create function fechar_comanda(
  p_comanda_id      uuid,
  p_forma_pagamento text,
  p_taxa_servico    numeric default null,
  p_desconto        numeric default null,
  p_itens_cortesia  uuid[] default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode fechar a conta.';
  end if;

  if p_itens_cortesia is not null then
    update itens_pedido
    set cortesia = (id = any(p_itens_cortesia))
    where pedido_id in (select id from pedidos where comanda_id = p_comanda_id);
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

grant execute on function fechar_comanda(uuid, text, numeric, numeric, uuid[]) to authenticated;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table comandas enable row level security;

create policy comandas_select on comandas for select to authenticated using (true);
create policy comandas_insert_staff on comandas for insert to authenticated with check (eh_staff());
create policy comandas_update_staff on comandas for update to authenticated using (eh_staff()) with check (eh_staff());

-- ─── Realtime ───────────────────────────────────────────────────────────────
alter publication supabase_realtime add table comandas;
alter table comandas replica identity full;
