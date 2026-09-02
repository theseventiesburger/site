-- Auditoria: registra quem criou/alterou/excluiu cada registro nas telas
-- sensíveis do painel (pedidos, pagamento, cupons e cadastros), com o
-- estado antes/depois. Rode este arquivo inteiro no SQL Editor do Supabase.

create table auditoria (
  id            bigint generated always as identity primary key,
  tabela        text not null,
  registro_id   text,
  acao          text not null check (acao in ('insert', 'update', 'delete')),
  usuario_id    uuid references auth.users(id) on delete set null,
  usuario_email text,
  dados_antigos jsonb,
  dados_novos   jsonb,
  created_at    timestamptz not null default now()
);

create index auditoria_tabela_registro_idx on auditoria (tabela, registro_id, created_at desc);
create index auditoria_created_at_idx on auditoria (created_at desc);

alter table auditoria enable row level security;

-- Qualquer conta do painel pode consultar o histórico. Não existe policy de
-- insert/update/delete para "authenticated": só a função abaixo (security
-- definer) escreve aqui, então ninguém edita o próprio rastro.
create policy auditoria_select on auditoria for select to authenticated using (true);

create function registrar_auditoria() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_email text;
begin
  select email into v_email from auth.users where id = auth.uid();

  insert into auditoria (tabela, registro_id, acao, usuario_id, usuario_email, dados_antigos, dados_novos)
  values (
    TG_TABLE_NAME,
    coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id'),
    lower(TG_OP),
    auth.uid(),
    v_email,
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

-- pedidos recebe um update de "total" toda vez que um item é inserido (o
-- trigger recalcular_total_pedido já existente), o que geraria uma entrada
-- de auditoria por item, sem nenhuma mudança relevante pra mostrar. O when
-- abaixo ignora updates que só tocam total/updated_at, sem precisar listar
-- coluna por coluna (nem manter a lista quando uma coluna nova entrar).
create trigger pedidos_auditoria_insert_delete
  after insert or delete on pedidos
  for each row execute function registrar_auditoria();

create trigger pedidos_auditoria_update
  after update on pedidos
  for each row
  when ((to_jsonb(new) - 'total' - 'updated_at') is distinct from (to_jsonb(old) - 'total' - 'updated_at'))
  execute function registrar_auditoria();

create trigger cupons_auditoria
  after insert or update or delete on cupons
  for each row execute function registrar_auditoria();

create trigger produtos_auditoria
  after insert or update or delete on produtos
  for each row execute function registrar_auditoria();

create trigger categorias_auditoria
  after insert or update or delete on categorias
  for each row execute function registrar_auditoria();

create trigger categorias_adicionais_auditoria
  after insert or update or delete on categorias_adicionais
  for each row execute function registrar_auditoria();

create trigger adicionais_auditoria
  after insert or update or delete on adicionais
  for each row execute function registrar_auditoria();

create trigger clientes_auditoria
  after insert or update or delete on clientes
  for each row execute function registrar_auditoria();

create trigger bairros_auditoria
  after insert or update or delete on bairros
  for each row execute function registrar_auditoria();
