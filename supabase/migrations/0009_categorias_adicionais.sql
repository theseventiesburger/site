-- Categorias de adicionais (ex: Pães, Proteínas, Queijos), pra organizar o
-- catálogo de adicionais e o checklist na hora de montar o pedido.

create table categorias_adicionais (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  nome       text not null,
  emoji      text,
  ativo      boolean not null default true,
  ordem      smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table categorias_adicionais enable row level security;

create policy categorias_adicionais_select on categorias_adicionais for select to authenticated using (true);
create policy categorias_adicionais_insert on categorias_adicionais for insert to authenticated with check (true);
create policy categorias_adicionais_update on categorias_adicionais for update to authenticated using (true) with check (true);

-- Sugestão inicial — edite/expanda livremente pelo admin depois.
insert into categorias_adicionais (slug, nome, emoji, ordem) values
  ('paes', 'Pães', '🍞', 1),
  ('proteinas', 'Proteínas', '🥩', 2),
  ('queijos', 'Queijos', '🧀', 3);

-- Nullable de propósito: adicionais já cadastrados ficam "sem categoria"
-- até alguém categorizar (não dá pra adivinhar a categoria certa por eles).
alter table adicionais add column categoria_id uuid references categorias_adicionais(id);

create index adicionais_categoria_id_idx on adicionais (categoria_id);
