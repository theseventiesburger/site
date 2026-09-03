-- Checkout público: o site vira um jeito real de pedir, não só WhatsApp.
-- criar_pedido_site é a única porta de entrada pra visitante anônimo (role
-- "anon") criar um pedido — nunca expomos criar_pedido() nem as tabelas
-- direto pro público, então nada de mesa/cliente_id/forma de pagamento
-- arbitrários vindo do navegador. Roda este arquivo inteiro no SQL Editor
-- do Supabase.

-- Visitante sem login precisa ver os bairros (e o frete de cada um) pra
-- montar o endereço de entrega.
create policy bairros_select_publico on bairros for select to anon using (ativo = true);

create function criar_pedido_site(
  p_cliente_nome     text,
  p_cliente_telefone text,
  p_endereco         text,
  p_bairro_id        uuid,
  p_ponto_referencia text default null,
  p_observacoes      text default null,
  p_cupom_codigo     text default null,
  p_itens            jsonb default '[]'::jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_bairro    bairros%rowtype;
  v_pedido_id uuid;
  v_pedido    pedidos%rowtype;
begin
  if p_cliente_nome is null or trim(p_cliente_nome) = '' then
    raise exception 'Informe seu nome.';
  end if;
  if p_cliente_telefone is null or trim(p_cliente_telefone) = '' then
    raise exception 'Informe seu telefone.';
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

  -- taxa de entrega vem do cadastro do bairro, nunca do navegador — senão
  -- dava pra zerar o frete só editando a requisição.
  v_pedido_id := criar_pedido(
    p_tipo             := 'delivery',
    p_mesa             := null,
    p_cliente_id       := null,
    p_cliente_nome     := p_cliente_nome,
    p_cliente_telefone := p_cliente_telefone,
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
    'desconto', v_pedido.desconto
  );
end;
$$;

grant execute on function criar_pedido_site(text, text, text, uuid, text, text, text, jsonb) to anon, authenticated;
