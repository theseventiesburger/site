-- Hambúrguer vegano/vegetariano também é hambúrguer — inclui a categoria
-- "Vegetarianos/Veganos" junto de "Hambúrgueres" no ranking de campeões de
-- vendas, mantendo bebida/sobremesa/porção de fora. Mesma assinatura de
-- 0039/0040 — só muda o corpo.
create or replace function produtos_mais_vendidos(p_limite integer default 3)
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
  join categorias c on c.id = p.categoria_id
  where pe.status <> 'cancelado'
    and p.ativo = true
    and c.nome in ('Hambúrgueres', 'Vegetarianos/Veganos')
  group by p.id
  order by quantidade_vendida desc
  limit greatest(p_limite, 0);
$$;

grant execute on function produtos_mais_vendidos(integer) to anon, authenticated;
