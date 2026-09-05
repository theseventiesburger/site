-- Combo dinâmico: qualquer hambúrguer marcado "pode virar combo" ganha
-- fritas + bebida junto (sempre as mesmas, configuradas uma vez em
-- Produtos) por um acréscimo que varia por hambúrguer — sem precisar
-- cadastrar um produto "X Combo" duplicado pra cada lanche. Rode este
-- arquivo inteiro no SQL Editor do Supabase.

alter table produtos add column pode_virar_combo boolean not null default false;
alter table produtos add column preco_combo numeric(10,2) not null default 0 check (preco_combo >= 0);

-- Singleton: só existe uma linha (o "boolean primary key" força isso).
create table combo_config (
  singleton         boolean primary key default true check (singleton),
  fritas_produto_id uuid references produtos(id),
  bebida_produto_id uuid references produtos(id)
);

insert into combo_config (singleton) values (true);

alter table combo_config enable row level security;

create policy combo_config_select on combo_config for select to authenticated using (true);
create policy combo_config_update_staff on combo_config for update to authenticated using (eh_staff()) with check (eh_staff());

-- criar_pedido: item com "combo": true cobra produto + preco_combo, e
-- entra também — sem custo (já embutido no preço do item principal) — a
-- fritas e a bebida fixas do combo, na mesma quantidade do item. Cada uma
-- segue a mesma regra de sempre pra decidir se vai pra Cozinha ou direto
-- pra mesa. Mesma assinatura de antes (0033) — só muda o corpo.
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
  p_itens            jsonb default '[]'::jsonb,
  p_comanda_id       uuid default null
) returns uuid
language plpgsql security invoker as $$
declare
  v_pedido_cozinha_id uuid;
  v_pedido_direto_id  uuid;
  v_pedido_id         uuid;
  v_mesa_id           smallint;
  v_item              jsonb;
  v_adicional         jsonb;
  v_item_pedido_id    uuid;
  v_produto_id        uuid;
  v_produto_nome      text;
  v_vai_cozinha       boolean;
  v_pode_combo        boolean;
  v_preco_combo       numeric;
  v_eh_combo          boolean;
  v_soma_adicionais   numeric;
  v_preco_adicional   numeric;
  v_subtotal_item     numeric;
  v_subtotal_itens    numeric := 0;
  v_cupom             cupons%rowtype;
  v_desconto          numeric := 0;
  v_combo_fritas_id   uuid;
  v_combo_bebida_id   uuid;
  v_extra_produto_id  uuid;
  v_extra_vai_cozinha boolean;
  v_extra_pedido_id   uuid;
begin
  if p_tipo = 'mesa' then
    select mesa_id into v_mesa_id from comandas where id = p_comanda_id and status = 'aberta';
    if v_mesa_id is null then
      raise exception 'Comanda não encontrada ou já fechada.';
    end if;
  end if;

  select fritas_produto_id, bebida_produto_id into v_combo_fritas_id, v_combo_bebida_id
  from combo_config limit 1;

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

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    v_produto_id := (v_item->>'produto_id')::uuid;
    v_eh_combo := coalesce((v_item->>'combo')::boolean, false);

    select produtos.vai_para_cozinha, produtos.pode_virar_combo, produtos.preco_combo, produtos.nome
      into v_vai_cozinha, v_pode_combo, v_preco_combo, v_produto_nome
    from produtos where produtos.id = v_produto_id;

    if not found then
      raise exception 'Produto não encontrado ou indisponível.';
    end if;

    if v_eh_combo and not v_pode_combo then
      raise exception 'Esse produto não pode virar combo.';
    end if;
    if v_eh_combo and (v_combo_fritas_id is null or v_combo_bebida_id is null) then
      raise exception 'Configure a fritas e a bebida do combo em Produtos antes de vender combo.';
    end if;

    if p_tipo = 'mesa' and not v_vai_cozinha then
      if v_pedido_direto_id is null then
        insert into pedidos (
          tipo, mesa_id, comanda_id, cliente_id, cliente_nome, cliente_telefone, endereco,
          bairro_id, cidade, estado, ponto_referencia,
          taxa_entrega, forma_pagamento, observacoes, status
        ) values (
          p_tipo, v_mesa_id, p_comanda_id, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
          p_bairro_id, p_cidade, p_estado, p_ponto_referencia,
          coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes, 'entregue'
        )
        returning id into v_pedido_direto_id;
      end if;
      v_pedido_id := v_pedido_direto_id;
    else
      if v_pedido_cozinha_id is null then
        insert into pedidos (
          tipo, mesa_id, comanda_id, cliente_id, cliente_nome, cliente_telefone, endereco,
          bairro_id, cidade, estado, ponto_referencia,
          taxa_entrega, forma_pagamento, observacoes
        ) values (
          p_tipo, v_mesa_id, p_comanda_id, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
          p_bairro_id, p_cidade, p_estado, p_ponto_referencia,
          coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes
        )
        returning id into v_pedido_cozinha_id;
      end if;
      v_pedido_id := v_pedido_cozinha_id;
    end if;

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
        and adicionais.ativo = true
        and (
          adicionais.categoria_id is null
          or exists (
            select 1 from produto_categorias_adicionais pca
            where pca.produto_id = v_produto_id and pca.categoria_adicional_id = adicionais.categoria_id
          )
        );

      v_soma_adicionais := v_soma_adicionais + coalesce(v_preco_adicional, 0);
    end loop;

    insert into itens_pedido (
      pedido_id, produto_id, nome_produto, preco_unitario, quantidade,
      observacao, ponto_carne, subtotal, status
    )
    select
      v_pedido_id,
      produtos.id,
      produtos.nome,
      produtos.preco + case when v_eh_combo then v_preco_combo else 0 end,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao',
      v_item->>'ponto_carne',
      (produtos.preco + v_soma_adicionais + case when v_eh_combo then v_preco_combo else 0 end)
        * (v_item->>'quantidade')::smallint,
      case when v_pedido_id = v_pedido_direto_id then 'entregue' else 'recebido' end
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
        and adicionais.ativo = true
        and (
          adicionais.categoria_id is null
          or exists (
            select 1 from produto_categorias_adicionais pca
            where pca.produto_id = v_produto_id and pca.categoria_adicional_id = adicionais.categoria_id
          )
        );
    end loop;

    if v_eh_combo then
      foreach v_extra_produto_id in array array[v_combo_fritas_id, v_combo_bebida_id]
      loop
        select vai_para_cozinha into v_extra_vai_cozinha from produtos where id = v_extra_produto_id;

        if p_tipo = 'mesa' and not v_extra_vai_cozinha then
          if v_pedido_direto_id is null then
            insert into pedidos (
              tipo, mesa_id, comanda_id, cliente_id, cliente_nome, cliente_telefone, endereco,
              bairro_id, cidade, estado, ponto_referencia,
              taxa_entrega, forma_pagamento, observacoes, status
            ) values (
              p_tipo, v_mesa_id, p_comanda_id, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
              p_bairro_id, p_cidade, p_estado, p_ponto_referencia,
              coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes, 'entregue'
            )
            returning id into v_pedido_direto_id;
          end if;
          v_extra_pedido_id := v_pedido_direto_id;
        else
          if v_pedido_cozinha_id is null then
            insert into pedidos (
              tipo, mesa_id, comanda_id, cliente_id, cliente_nome, cliente_telefone, endereco,
              bairro_id, cidade, estado, ponto_referencia,
              taxa_entrega, forma_pagamento, observacoes
            ) values (
              p_tipo, v_mesa_id, p_comanda_id, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_endereco,
              p_bairro_id, p_cidade, p_estado, p_ponto_referencia,
              coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_observacoes
            )
            returning id into v_pedido_cozinha_id;
          end if;
          v_extra_pedido_id := v_pedido_cozinha_id;
        end if;

        insert into itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade, observacao, subtotal, status)
        select
          v_extra_pedido_id,
          produtos.id,
          produtos.nome,
          0,
          (v_item->>'quantidade')::smallint,
          'Combo — ' || v_produto_nome,
          0,
          case when v_extra_pedido_id = v_pedido_direto_id then 'entregue' else 'recebido' end
        from produtos
        where produtos.id = v_extra_produto_id;
      end loop;
    end if;
  end loop;

  if v_pedido_cozinha_id is null and v_pedido_direto_id is null then
    raise exception 'Nenhum item foi lançado.';
  end if;

  if v_cupom.id is not null then
    if v_subtotal_itens < v_cupom.valor_minimo_pedido then
      raise exception 'Pedido mínimo de % para usar o cupom "%".', v_cupom.valor_minimo_pedido, p_cupom_codigo;
    end if;

    v_desconto := case
      when v_cupom.tipo_desconto = 'percentual' then round(v_subtotal_itens * v_cupom.valor / 100, 2)
      else least(v_cupom.valor, v_subtotal_itens + coalesce(p_taxa_entrega, 0))
    end;

    update pedidos set cupom_id = v_cupom.id, desconto = v_desconto
    where id = coalesce(v_pedido_cozinha_id, v_pedido_direto_id);
    update cupons set usos_realizados = usos_realizados + 1 where id = v_cupom.id;
  end if;

  return coalesce(v_pedido_cozinha_id, v_pedido_direto_id);
end;
$$;
