-- Retirada no balcão como opção no checkout do site, ao lado de entrega.
-- Vira um tipo de pedido próprio (não empresta de "pdv", que é venda batida
-- pelo atendente no balcão) — assim o relatório por tipo não mistura as
-- duas coisas. Rode este arquivo inteiro no SQL Editor do Supabase.

alter table pedidos drop constraint if exists pedidos_tipo_check;
alter table pedidos add constraint pedidos_tipo_check check (tipo in ('mesa', 'delivery', 'pdv', 'retirada'));

-- criar_pedido_site: passa a receber o tipo de entrega escolhido pelo
-- cliente. "Retirada" não pede bairro/endereço nem cobra taxa; "entrega"
-- continua exatamente como antes.
drop function if exists criar_pedido_site(text, uuid, text, text, text, jsonb);

create or replace function criar_pedido_site(
  p_tipo_entrega     text default 'entrega', -- 'entrega' | 'retirada'
  p_endereco         text default null,
  p_bairro_id        uuid default null,
  p_ponto_referencia text default null,
  p_observacoes      text default null,
  p_cupom_codigo     text default null,
  p_itens            jsonb default '[]'::jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_cliente      clientes%rowtype;
  v_bairro       bairros%rowtype;
  v_tipo_pedido  text;
  v_taxa_entrega numeric := 0;
  v_pedido_id    uuid;
  v_pedido       pedidos%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta pra finalizar o pedido.';
  end if;

  select * into v_cliente from clientes where user_id = auth.uid();
  if v_cliente.id is null then
    raise exception 'Complete seu cadastro antes de finalizar o pedido.';
  end if;

  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'O carrinho está vazio.';
  end if;

  if p_tipo_entrega = 'retirada' then
    v_tipo_pedido := 'retirada';
  elsif p_tipo_entrega = 'entrega' then
    v_tipo_pedido := 'delivery';

    if p_endereco is null or trim(p_endereco) = '' then
      raise exception 'Informe o endereço de entrega.';
    end if;

    select * into v_bairro from bairros where id = p_bairro_id and ativo = true;
    if v_bairro.id is null then
      raise exception 'Selecione um bairro válido.';
    end if;

    v_taxa_entrega := v_bairro.valor_entrega;
  else
    raise exception 'Tipo de pedido inválido.';
  end if;

  v_pedido_id := criar_pedido(
    p_tipo             := v_tipo_pedido,
    p_mesa             := null,
    p_cliente_id       := v_cliente.id,
    p_cliente_nome     := v_cliente.nome,
    p_cliente_telefone := v_cliente.telefone,
    p_endereco         := case when v_tipo_pedido = 'delivery' then p_endereco else null end,
    p_bairro_id        := v_bairro.id,
    p_cidade           := null,
    p_estado           := null,
    p_ponto_referencia := case when v_tipo_pedido = 'delivery' then p_ponto_referencia else null end,
    p_taxa_entrega     := v_taxa_entrega,
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

grant execute on function criar_pedido_site(text, text, uuid, text, text, text, jsonb) to authenticated;
