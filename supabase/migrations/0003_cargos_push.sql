-- Cargos por conta (garçom/cozinha) e inscrições de notificação push.
-- Rode este arquivo, depois supabase/seed/0004_perfis_iniciais.sql.

create table perfis (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  cargo      text not null check (cargo in ('garcom', 'cozinha')),
  created_at timestamptz not null default now()
);

alter table perfis enable row level security;

create policy perfis_select_proprio on perfis
  for select to authenticated
  using (auth.uid() = user_id);

create table push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth_key   text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy push_subscriptions_dono on push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
