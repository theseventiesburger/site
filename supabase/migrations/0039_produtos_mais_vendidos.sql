-- RPC pra "Campeões de Vendas" na home: soma a quantidade vendida de cada
-- produto (todas as rodadas, exceto pedido cancelado) e devolve os mais
-- vendidos. security definer porque itens_pedido/pedidos só têm select
-- liberado pra staff ou pro próprio cliente dono do pedido (0025) — a
-- função soma tudo mas só expõe dado agregado por produto (nada de nome,
-- telefone ou endereço de cliente), então é seguro liberar pro público.

create function produtos_mais_vendidos(p_limite integer default 3)
returns table (
  produto_id         uuid,
  nome               text,
  descricao          text,
  imagem             text,
  preco              numeric,
  preco_promocional  numeric,
  slug               text,
  tag                text,
  quantidade_vendida bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.nome,
    p.descricao,
    p.imagem,
    p.preco,
    p.preco_promocional,
    p.slug,
    p.tag,
    sum(ip.quantidade)::bigint as quantidade_vendida
  from itens_pedido ip
  join pedidos pe on pe.id = ip.pedido_id
  join produtos p on p.id = ip.produto_id
  where pe.status <> 'cancelado'
    and p.ativo = true
  group by p.id
  order by quantidade_vendida desc
  limit greatest(p_limite, 0);
$$;

grant execute on function produtos_mais_vendidos(integer) to anon, authenticated;
