-- Integração com o UaiRango Connect (plataforma de delivery externa) —
-- pedido feito lá entra direto como pedido de verdade aqui (já foi
-- confirmado/pago pelo cliente na plataforma deles), sem passar por tela
-- de revisão. Itens entram só com nome/preço, sem precisar bater com um
-- produto cadastrado (produto_id fica null nesse caso) — não conta pro
-- ranking de mais vendidos por enquanto (esse já filtra por join com
-- produtos), mas aparece certinho na Cozinha e no relatório. Rode este
-- arquivo inteiro no SQL Editor do Supabase.

alter table itens_pedido alter column produto_id drop not null;

-- Guarda o id do pedido lá do UaiRango — evita duplicar se o mesmo evento
-- chegar de novo (webhook não garante entrega única) e é o que a gente usa
-- pra chamar de volta a API deles (confirmar, despachar, cancelar).
alter table pedidos add column uairango_order_id text unique;

-- Cache do token de acesso (client_credentials/refresh_token expira em
-- 6h/168h) — evita pedir um token novo em toda chamada. Linha única,
-- reaproveitada até expirar.
create table uairango_auth (
  id            smallint primary key default 1,
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz not null,
  constraint uairango_auth_singleton check (id = 1)
);

alter table uairango_auth enable row level security;
-- Sem policy nenhuma: só o service role (que já ignora RLS) acessa essa
-- tabela — não é pra nenhum staff nem cliente ler ou escrever direto.

create function criar_pedido_uairango(
  p_uairango_order_id text,
  p_tipo              text,
  p_cliente_nome      text,
  p_cliente_telefone  text,
  p_endereco          text,
  p_taxa_entrega      numeric default 0,
  p_forma_pagamento   text default null,
  p_pago              boolean default true,
  p_observacoes       text default null,
  p_itens             jsonb default '[]'::jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_pedido_id uuid;
  v_item      jsonb;
begin
  -- Idempotente: se o mesmo pedido chegar de novo (reenvio de webhook),
  -- devolve o id já criado em vez de duplicar.
  select id into v_pedido_id from pedidos where uairango_order_id = p_uairango_order_id;
  if v_pedido_id is not null then
    return v_pedido_id;
  end if;

  insert into pedidos (
    tipo, cliente_nome, cliente_telefone, endereco,
    taxa_entrega, forma_pagamento, pago, observacoes, uairango_order_id
  ) values (
    p_tipo, p_cliente_nome, p_cliente_telefone, p_endereco,
    coalesce(p_taxa_entrega, 0), p_forma_pagamento, p_pago, p_observacoes, p_uairango_order_id
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    insert into itens_pedido (
      pedido_id, produto_id, nome_produto, preco_unitario, quantidade, observacao, subtotal
    ) values (
      v_pedido_id,
      null,
      v_item->>'nome',
      (v_item->>'preco_unitario')::numeric,
      (v_item->>'quantidade')::smallint,
      v_item->>'observacao',
      (v_item->>'preco_unitario')::numeric * (v_item->>'quantidade')::smallint
    );
  end loop;

  return v_pedido_id;
end;
$$;

-- Só o service role chama isso (a partir do webhook, servidor pra
-- servidor) — não faz sentido cliente nem staff autenticado criar pedido
-- "vindo do UaiRango" direto pelo navegador.
grant execute on function criar_pedido_uairango(text, text, text, text, text, numeric, text, boolean, text, jsonb) to service_role;
