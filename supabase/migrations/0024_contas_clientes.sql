-- Conta de cliente no site: cadastro com e-mail/senha (Supabase Auth),
-- ligado ao cadastro em `clientes` — assim o endereço/telefone ficam
-- salvos e reaproveitados nos próximos pedidos. Pedido pelo site passa a
-- exigir login. Rode este arquivo inteiro no SQL Editor do Supabase.

alter table clientes add column user_id uuid references auth.users(id) on delete set null;
create unique index clientes_user_id_unq on clientes (user_id) where user_id is not null;

-- Usada nas policies abaixo pra distinguir conta de atendente (tem perfil)
-- de conta de cliente (não tem). `perfis` já restringe a leitura à própria
-- linha, então essa função só enxerga o que o próprio chamador já vê.
create function eh_staff() returns boolean
language sql stable as $$
  select exists (select 1 from perfis where perfis.user_id = auth.uid());
$$;

-- ─── clientes: antes "qualquer autenticado vê tudo" — agora que cliente
-- também é uma conta autenticada, isso vazaria endereço/telefone de todo
-- mundo pra qualquer cliente logado. Atendente continua vendo tudo; cliente
-- só vê o próprio cadastro.
drop policy clientes_select on clientes;
drop policy clientes_insert on clientes;
drop policy clientes_update on clientes;

create policy clientes_select_staff on clientes for select to authenticated
  using (eh_staff());
create policy clientes_insert_staff on clientes for insert to authenticated
  with check (eh_staff());
create policy clientes_update_staff on clientes for update to authenticated
  using (eh_staff()) with check (eh_staff());

create policy clientes_select_proprio on clientes for select to authenticated
  using (user_id = auth.uid());
create policy clientes_insert_proprio on clientes for insert to authenticated
  with check (user_id = auth.uid());
create policy clientes_update_proprio on clientes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── pedidos: mesmo problema — cliente logado só pode ver os próprios
-- pedidos (é o que permite a tela de confirmação acompanhar o pagamento
-- em tempo real via Realtime, que também respeita RLS).
drop policy pedidos_select on pedidos;

create policy pedidos_select_staff on pedidos for select to authenticated
  using (eh_staff());
create policy pedidos_select_proprio on pedidos for select to authenticated
  using (cliente_id in (select id from clientes where user_id = auth.uid()));

-- ─── cria a linha em `clientes` automaticamente quando alguém se cadastra
-- pelo site (nome/telefone chegam no metadata do signUp). Contas criadas
-- pelo painel do Supabase pra atendente não têm esse metadata, então não
-- ganham uma linha de cliente à toa.
create function criar_cliente_ao_registrar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_user_meta_data ? 'nome' then
    insert into clientes (user_id, nome, telefone)
    values (new.id, new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'telefone');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function criar_cliente_ao_registrar();

-- ─── criar_pedido_site: agora exige login. Nome/telefone/cliente_id vêm do
-- cadastro (auth.uid() → clientes), nunca do navegador — cliente não
-- escolhe fazer pedido em nome de outro cadastro.
drop function if exists criar_pedido_site(text, text, text, uuid, text, text, text, jsonb);

create function criar_pedido_site(
  p_endereco         text,
  p_bairro_id        uuid,
  p_ponto_referencia text default null,
  p_observacoes      text default null,
  p_cupom_codigo     text default null,
  p_itens            jsonb default '[]'::jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_cliente   clientes%rowtype;
  v_bairro    bairros%rowtype;
  v_pedido_id uuid;
  v_pedido    pedidos%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta pra finalizar o pedido.';
  end if;

  select * into v_cliente from clientes where user_id = auth.uid();
  if v_cliente.id is null then
    raise exception 'Complete seu cadastro antes de finalizar o pedido.';
  end if;

  if p_endereco is null or trim(p_endereco) = '' then
    raise exception 'Informe o endereço de entrega.';
  end if;
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'O carrinho está vazio.';
  end if;

  select * into v_bairro from bairros where id = p_bairro_id and ativo = true;
  if v_bairro.id is null then
    raise exception 'Selecione um bairro válido.';
  end if;

  v_pedido_id := criar_pedido(
    p_tipo             := 'delivery',
    p_mesa             := null,
    p_cliente_id       := v_cliente.id,
    p_cliente_nome     := v_cliente.nome,
    p_cliente_telefone := v_cliente.telefone,
    p_endereco         := p_endereco,
    p_bairro_id        := v_bairro.id,
    p_cidade           := null,
    p_estado           := null,
    p_ponto_referencia := p_ponto_referencia,
    p_taxa_entrega     := v_bairro.valor_entrega,
    p_forma_pagamento  := 'pix',
    p_observacoes      := p_observacoes,
    p_cupom_codigo     := p_cupom_codigo,
    p_itens            := p_itens
  );

  select * into v_pedido from pedidos where id = v_pedido_id;

  return jsonb_build_object(
    'id', v_pedido.id,
    'numero', v_pedido.numero,
    'total', v_pedido.total,
    'desconto', v_pedido.desconto,
    'pago', v_pedido.pago
  );
end;
$$;

grant execute on function criar_pedido_site(text, uuid, text, text, text, jsonb) to authenticated;
