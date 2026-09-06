-- "Campeões de Vendas" e os slides de destaque do banner devem considerar
-- só hambúrguer — bebida (chopp, refrigerante) tava aparecendo entre os
-- mais vendidos porque a função somava quantidade de qualquer produto.
-- Filtra pela categoria "Hambúrgueres" (mesma que já agrupa o cadastro e
-- o cardápio público). Mesma assinatura de 0039 — só muda o corpo.
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
    and c.nome = 'Hambúrgueres'
  group by p.id
  order by quantidade_vendida desc
  limit greatest(p_limite, 0);
$$;

grant execute on function produtos_mais_vendidos(integer) to anon, authenticated;
