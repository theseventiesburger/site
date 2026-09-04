-- Taxa de serviço (garçom) nas vendas de mesa: 10% do subtotal, aplicada
-- automaticamente na criação do pedido — mas não é obrigatória, então dá
-- pra tirar (ou recolocar) na hora de fechar a conta. Aproveita e adiciona,
-- também só na hora de fechar a conta: desconto manual (sem precisar de
-- cupom) e cortesia por item (ex: brinde de aniversário). Rode este
-- arquivo inteiro no SQL Editor do Supabase.

alter table pedidos add column taxa_servico numeric(10,2) not null default 0 check (taxa_servico >= 0);
alter table pedidos add constraint taxa_servico_apenas_mesa check (tipo = 'mesa' or taxa_servico = 0);

alter table itens_pedido add column cortesia boolean not null default false;

-- ─── total do pedido passa a excluir item de cortesia e somar a taxa de serviço
create or replace function recalcular_total_pedido() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pedido_id uuid;
begin
  v_pedido_id := coalesce(new.pedido_id, old.pedido_id);

  update pedidos
  set total = (
    select coalesce(sum(subtotal) filter (where not cortesia), 0)
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
    select coalesce(sum(subtotal) filter (where not cortesia), 0)
    from itens_pedido
    where pedido_id = new.id
  ) + new.taxa_entrega + new.taxa_servico - new.desconto
  where id = new.id;

  return new;
end;
$$;

drop trigger pedidos_recalcula_total_por_taxa on pedidos;
create trigger pedidos_recalcula_total_por_taxa
  after update of taxa_entrega, taxa_servico, desconto on pedidos
  for each row execute function recalcular_total_por_taxa();

-- ─── criar_pedido: aplica os 10% de taxa de serviço sozinho pra mesa ───────
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
  v_taxa_servico    numeric := 0;
begin
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

  if p_tipo = 'mesa' then
    v_taxa_servico := round(v_subtotal_itens * 0.10, 2);
    update pedidos set taxa_servico = v_taxa_servico where id = v_pedido_id;
  end if;

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

-- ─── fechar_conta_pedido: fecha a conta da mesa numa transação só — marca
-- os itens de cortesia escolhidos, ajusta taxa de serviço e desconto (se
-- informados) e confirma o pagamento. Security definer porque itens_pedido
-- não tem policy de update pra ninguém (só leitura/inserção) — a checagem
-- de atendente fica por conta da função mesmo.
create or replace function fechar_conta_pedido(
  p_pedido_id       uuid,
  p_forma_pagamento text,
  p_taxa_servico    numeric default null, -- null = mantém o valor atual
  p_desconto        numeric default null, -- null = mantém o valor atual
  p_itens_cortesia  uuid[] default null    -- ids de itens_pedido que ficam de cortesia; os demais do pedido voltam a cobrar. null = não mexe
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode fechar a conta.';
  end if;

  if p_itens_cortesia is not null then
    update itens_pedido
    set cortesia = (id = any(p_itens_cortesia))
    where pedido_id = p_pedido_id;
  end if;

  update pedidos
  set
    taxa_servico    = coalesce(p_taxa_servico, taxa_servico),
    desconto        = coalesce(p_desconto, desconto),
    pago            = true,
    forma_pagamento = p_forma_pagamento
  where id = p_pedido_id;
end;
$$;

grant execute on function fechar_conta_pedido(uuid, text, numeric, numeric, uuid[]) to authenticated;
