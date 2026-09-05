-- Nem todo adicional faz sentido pra todo produto (cerveja não recebe
-- adição de queijo, por exemplo). Controla isso por CATEGORIA de adicional
-- (Pães, Proteínas, Queijos...) em vez de item por item no cadastro — bem
-- menos checkbox pra marcar por produto. Todo produto já cadastrado
-- recebe, de saída, todas as categorias que já existem hoje (ninguém
-- perde nenhum adicional que já tinha) — dá pra tirar categoria por
-- categoria depois, produto por produto, na tela de Produtos. Rode este
-- arquivo inteiro no SQL Editor do Supabase.

create table produto_categorias_adicionais (
  produto_id             uuid not null references produtos(id) on delete cascade,
  categoria_adicional_id uuid not null references categorias_adicionais(id) on delete cascade,
  primary key (produto_id, categoria_adicional_id)
);

insert into produto_categorias_adicionais (produto_id, categoria_adicional_id)
select produtos.id, categorias_adicionais.id
from produtos cross join categorias_adicionais;

alter table produto_categorias_adicionais enable row level security;

create policy produto_categorias_adicionais_select on produto_categorias_adicionais for select to authenticated using (true);
create policy produto_categorias_adicionais_insert_staff on produto_categorias_adicionais for insert to authenticated with check (eh_staff());
create policy produto_categorias_adicionais_delete_staff on produto_categorias_adicionais for delete to authenticated using (eh_staff());

-- criar_pedido: adicional só entra se a categoria dele estiver liberada pro
-- produto (adicional sem categoria continua liberado pra qualquer produto,
-- como sempre foi). Mesma assinatura de antes (0032) — só muda o corpo.
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
  v_vai_cozinha       boolean;
  v_soma_adicionais   numeric;
  v_preco_adicional   numeric;
  v_subtotal_item     numeric;
  v_subtotal_itens    numeric := 0;
  v_cupom             cupons%rowtype;
  v_desconto          numeric := 0;
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

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    v_produto_id := (v_item->>'produto_id')::uuid;

    select produtos.vai_para_cozinha into v_vai_cozinha
    from produtos where produtos.id = v_produto_id;

    if not found then
      raise exception 'Produto não encontrado ou indisponível.';
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
      produtos.preco,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao',
      v_item->>'ponto_carne',
      (produtos.preco + v_soma_adicionais) * (v_item->>'quantidade')::smallint,
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
