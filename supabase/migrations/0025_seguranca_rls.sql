-- Fechamento de segurança: até a conta de cliente existir (0024), toda
-- policy "to authenticated using (true)" era segura, porque só atendente
-- tinha login. Agora cliente também é authenticated — e essas mesmas
-- policies deixam ele ler pedido/telefone/endereço de qualquer outra
-- pessoa, mexer em preço, cupom, estoque e até confirmar pagamento do
-- pedido alheio. Esse arquivo revisita toda tabela que ficou exposta.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

-- ─── pedidos: criação/edição só por atendente. O checkout do site nunca
-- passou por aqui — ele usa criar_pedido_site, que é security definer e
-- não depende dessa policy.
drop policy if exists pedidos_insert on pedidos;
drop policy if exists pedidos_update on pedidos;

drop policy if exists pedidos_insert_staff on pedidos;
create policy pedidos_insert_staff on pedidos for insert to authenticated with check (eh_staff());
drop policy if exists pedidos_update_staff on pedidos;
create policy pedidos_update_staff on pedidos for update to authenticated using (eh_staff()) with check (eh_staff());

-- ─── itens_pedido: mesmo problema — cliente lia item de pedido alheio
-- (telefone/endereço via join) e podia inserir item com preço inventado
-- em qualquer pedido.
drop policy if exists itens_pedido_select on itens_pedido;
drop policy if exists itens_pedido_insert on itens_pedido;

drop policy if exists itens_pedido_select_staff on itens_pedido;
create policy itens_pedido_select_staff on itens_pedido for select to authenticated using (eh_staff());
drop policy if exists itens_pedido_select_proprio on itens_pedido;
create policy itens_pedido_select_proprio on itens_pedido for select to authenticated
  using (pedido_id in (select id from pedidos where cliente_id in (select id from clientes where user_id = auth.uid())));
drop policy if exists itens_pedido_insert_staff on itens_pedido;
create policy itens_pedido_insert_staff on itens_pedido for insert to authenticated with check (eh_staff());

-- ─── itens_pedido_adicionais: mesma lógica.
drop policy if exists itens_pedido_adicionais_select on itens_pedido_adicionais;
drop policy if exists itens_pedido_adicionais_insert on itens_pedido_adicionais;

drop policy if exists itens_pedido_adicionais_select_staff on itens_pedido_adicionais;
create policy itens_pedido_adicionais_select_staff on itens_pedido_adicionais for select to authenticated using (eh_staff());
drop policy if exists itens_pedido_adicionais_select_proprio on itens_pedido_adicionais;
create policy itens_pedido_adicionais_select_proprio on itens_pedido_adicionais for select to authenticated
  using (item_pedido_id in (
    select ip.id from itens_pedido ip
    join pedidos p on p.id = ip.pedido_id
    where p.cliente_id in (select id from clientes where user_id = auth.uid())
  ));
drop policy if exists itens_pedido_adicionais_insert_staff on itens_pedido_adicionais;
create policy itens_pedido_adicionais_insert_staff on itens_pedido_adicionais for insert to authenticated with check (eh_staff());

-- ─── cupons: leitura pública já existia só pra anon (ativo=true) — cliente
-- logado caía na policy antiga "authenticated using(true)" e via cupom
-- inativo/expirado, além de poder editar valor/limite de qualquer cupom.
drop policy if exists cupons_select on cupons;
drop policy if exists cupons_select_publico on cupons;
drop policy if exists cupons_insert on cupons;
drop policy if exists cupons_update on cupons;

drop policy if exists cupons_select_staff on cupons;
create policy cupons_select_staff on cupons for select to authenticated using (eh_staff());
drop policy if exists cupons_select_publico on cupons;
create policy cupons_select_publico on cupons for select to anon, authenticated using (ativo = true);
drop policy if exists cupons_insert_staff on cupons;
create policy cupons_insert_staff on cupons for insert to authenticated with check (eh_staff());
drop policy if exists cupons_update_staff on cupons;
create policy cupons_update_staff on cupons for update to authenticated using (eh_staff()) with check (eh_staff());

-- ─── auditoria: o maior vazamento — reexpunha clientes/pedidos de outras
-- pessoas (nome, telefone, endereço) via dados_antigos/dados_novos, mesmo
-- depois de já ter travado a tabela clientes em si.
drop policy if exists auditoria_select on auditoria;
drop policy if exists auditoria_select_staff on auditoria;
create policy auditoria_select_staff on auditoria for select to authenticated using (eh_staff());

-- ─── cadastros do cardápio: leitura pública (produtos/categorias) continua
-- igual, só a escrita passa a exigir atendente.
drop policy if exists produtos_insert on produtos;
drop policy if exists produtos_update on produtos;
drop policy if exists produtos_insert_staff on produtos;
create policy produtos_insert_staff on produtos for insert to authenticated with check (eh_staff());
drop policy if exists produtos_update_staff on produtos;
create policy produtos_update_staff on produtos for update to authenticated using (eh_staff()) with check (eh_staff());

drop policy if exists produtos_storage_insert on storage.objects;
drop policy if exists produtos_storage_update on storage.objects;
drop policy if exists produtos_storage_insert_staff on storage.objects;
create policy produtos_storage_insert_staff on storage.objects for insert to authenticated with check (bucket_id = 'produtos' and eh_staff());
drop policy if exists produtos_storage_update_staff on storage.objects;
create policy produtos_storage_update_staff on storage.objects for update to authenticated using (bucket_id = 'produtos' and eh_staff()) with check (bucket_id = 'produtos' and eh_staff());

drop policy if exists categorias_insert on categorias;
drop policy if exists categorias_update on categorias;
drop policy if exists categorias_insert_staff on categorias;
create policy categorias_insert_staff on categorias for insert to authenticated with check (eh_staff());
drop policy if exists categorias_update_staff on categorias;
create policy categorias_update_staff on categorias for update to authenticated using (eh_staff()) with check (eh_staff());

drop policy if exists categorias_adicionais_insert on categorias_adicionais;
drop policy if exists categorias_adicionais_update on categorias_adicionais;
drop policy if exists categorias_adicionais_insert_staff on categorias_adicionais;
create policy categorias_adicionais_insert_staff on categorias_adicionais for insert to authenticated with check (eh_staff());
drop policy if exists categorias_adicionais_update_staff on categorias_adicionais;
create policy categorias_adicionais_update_staff on categorias_adicionais for update to authenticated using (eh_staff()) with check (eh_staff());

drop policy if exists adicionais_insert on adicionais;
drop policy if exists adicionais_update on adicionais;
drop policy if exists adicionais_insert_staff on adicionais;
create policy adicionais_insert_staff on adicionais for insert to authenticated with check (eh_staff());
drop policy if exists adicionais_update_staff on adicionais;
create policy adicionais_update_staff on adicionais for update to authenticated using (eh_staff()) with check (eh_staff());

-- (produto_adicionais existiu só até 0010_adicionais_sem_vinculo.sql, que
-- já derrubou a tabela — adicional deixou de ser vinculado a produto
-- específico faz tempo.)

-- ─── bairros: cliente conseguia zerar a taxa de entrega de qualquer bairro
-- (a mesma que criar_pedido_site usa pra calcular o frete de todo mundo).
drop policy if exists bairros_insert on bairros;
drop policy if exists bairros_update on bairros;
drop policy if exists bairros_insert_staff on bairros;
create policy bairros_insert_staff on bairros for insert to authenticated with check (eh_staff());
drop policy if exists bairros_update_staff on bairros;
create policy bairros_update_staff on bairros for update to authenticated using (eh_staff()) with check (eh_staff());

-- ─── estoque: nada disso tem por que ser visível/editável por cliente —
-- ficha técnica e saldo de insumo são operação interna.
drop policy if exists insumos_select on insumos;
drop policy if exists insumos_insert on insumos;
drop policy if exists insumos_update on insumos;
drop policy if exists insumos_select_staff on insumos;
create policy insumos_select_staff on insumos for select to authenticated using (eh_staff());
drop policy if exists insumos_insert_staff on insumos;
create policy insumos_insert_staff on insumos for insert to authenticated with check (eh_staff());
drop policy if exists insumos_update_staff on insumos;
create policy insumos_update_staff on insumos for update to authenticated using (eh_staff()) with check (eh_staff());

drop policy if exists receita_itens_select on receita_itens;
drop policy if exists receita_itens_insert on receita_itens;
drop policy if exists receita_itens_update on receita_itens;
drop policy if exists receita_itens_delete on receita_itens;
drop policy if exists receita_itens_select_staff on receita_itens;
create policy receita_itens_select_staff on receita_itens for select to authenticated using (eh_staff());
drop policy if exists receita_itens_insert_staff on receita_itens;
create policy receita_itens_insert_staff on receita_itens for insert to authenticated with check (eh_staff());
drop policy if exists receita_itens_update_staff on receita_itens;
create policy receita_itens_update_staff on receita_itens for update to authenticated using (eh_staff()) with check (eh_staff());
drop policy if exists receita_itens_delete_staff on receita_itens;
create policy receita_itens_delete_staff on receita_itens for delete to authenticated using (eh_staff());

drop policy if exists movimentos_estoque_select on movimentos_estoque;
drop policy if exists movimentos_estoque_select_staff on movimentos_estoque;
create policy movimentos_estoque_select_staff on movimentos_estoque for select to authenticated using (eh_staff());

-- registrar_movimento_estoque é chamada só pela tela de Estoque — trava
-- por dentro da função também, já que GRANT/REVOKE não distingue cliente
-- de atendente (os dois são o mesmo papel "authenticated" no Postgres).
create or replace function registrar_movimento_estoque(
  p_insumo_id uuid,
  p_quantidade numeric,
  p_tipo text,
  p_motivo text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text;
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode registrar movimentação de estoque.';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  insert into movimentos_estoque (insumo_id, quantidade, tipo, motivo, usuario_id, usuario_email)
  values (p_insumo_id, p_quantidade, p_tipo, p_motivo, auth.uid(), v_email);

  update insumos set estoque_atual = estoque_atual + p_quantidade where id = p_insumo_id;
end;
$$;

-- ─── criar_pedido: dois ajustes de correção que não são sobre RLS ─────────
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
