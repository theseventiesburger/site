-- Categorias viram um cadastro administrável (antes eram um enum fixo no
-- código), ligadas a cada produto por uma coluna categoria_id.

create table categorias (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  nome       text not null,
  emoji      text,
  ativo      boolean not null default true,
  ordem      smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table categorias enable row level security;

create policy categorias_select_publico on categorias for select to anon using (ativo = true);
create policy categorias_select on categorias for select to authenticated using (true);
create policy categorias_insert on categorias for insert to authenticated with check (true);
create policy categorias_update on categorias for update to authenticated using (true) with check (true);

-- Semeia as 5 categorias que já existiam fixas no código.
insert into categorias (slug, nome, emoji, ordem) values
  ('especiais', 'Especiais', '⭐', 1),
  ('classicos', 'Clássicos', '👑', 2),
  ('combos', 'Combos', '🍟', 3),
  ('bebidas', 'Bebidas', '🥤', 4),
  ('sobremesas', 'Sobremesas', '🍦', 5);

-- Migra produtos.categoria (texto fixo) para produtos.categoria_id (FK).
alter table produtos add column categoria_id uuid references categorias(id);

update produtos set categoria_id = categorias.id
from categorias
where categorias.slug = produtos.categoria;

alter table produtos alter column categoria_id set not null;
alter table produtos drop column categoria;

create index produtos_categoria_id_idx on produtos (categoria_id);
