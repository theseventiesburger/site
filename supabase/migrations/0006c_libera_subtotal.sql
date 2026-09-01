-- Converte itens_pedido.subtotal de coluna gerada pra coluna normal
-- (necessário pra somar os adicionais, que vêm de outra tabela).
-- Seguro rodar mais de uma vez: só faz algo se a coluna ainda for gerada.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'itens_pedido'
      and column_name = 'subtotal'
      and is_generated = 'ALWAYS'
  ) then
    alter table itens_pedido alter column subtotal drop expression;
  end if;
end $$;
