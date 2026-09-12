-- Achado no relatório de vendas: a maioria dos fechamentos aparecia como
-- "Não informado" na forma de pagamento. Causa: fechar_comanda (mesa) só
-- grava forma_pagamento/pago na própria comanda — nunca nas rodadas
-- (`pedidos`) que ela agrupa. O relatório lê `pedidos.forma_pagamento`
-- direto (listarPedidosPeriodo, sem join com comandas), então toda mesa
-- fechada cai em "não informado" ali, mesmo com a forma de pagamento
-- certinha guardada na comanda. Delivery/pdv nunca tiveram esse problema —
-- fecham por fechar_pedido (0046) ou definirPagamentoPedido, que já
-- gravam direto no pedido. Rode este arquivo inteiro no SQL Editor do
-- Supabase.

create or replace function fechar_comanda(
  p_comanda_id      uuid,
  p_forma_pagamento text,
  p_taxa_servico    numeric default null,
  p_desconto        numeric default null,
  p_itens_cortesia  uuid[] default null,
  p_itens_precos    jsonb default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb;
begin
  if not eh_staff() then
    raise exception 'Só a equipe pode fechar a conta.';
  end if;

  if p_itens_cortesia is not null then
    update itens_pedido
    set cortesia = (id = any(p_itens_cortesia))
    where pedido_id in (select id from pedidos where comanda_id = p_comanda_id);
  end if;

  if p_itens_precos is not null then
    for v_item in select * from jsonb_array_elements(p_itens_precos)
    loop
      update itens_pedido
      set preco_unitario = (v_item->>'preco_unitario')::numeric
      where id = (v_item->>'id')::uuid
        and pedido_id in (select id from pedidos where comanda_id = p_comanda_id);
    end loop;
  end if;

  update comandas
  set
    taxa_servico    = coalesce(p_taxa_servico, taxa_servico),
    desconto        = coalesce(p_desconto, desconto),
    forma_pagamento = p_forma_pagamento,
    status          = 'fechada',
    fechada_em      = now()
  where id = p_comanda_id;

  -- Espelha forma de pagamento/pago em cada rodada — é o que o relatório
  -- de vendas (e qualquer outra tela que leia `pedidos` direto) enxerga.
  update pedidos
  set forma_pagamento = p_forma_pagamento, pago = true
  where comanda_id = p_comanda_id;
end;
$$;

-- ─── backfill: mesas já fechadas antes deste conserto ficam presas em
-- "não informado" pra sempre se não corrigir aqui também.
update pedidos p
set forma_pagamento = c.forma_pagamento, pago = true
from comandas c
where p.comanda_id = c.id
  and c.status = 'fechada'
  and c.forma_pagamento is not null
  and p.forma_pagamento is null;
