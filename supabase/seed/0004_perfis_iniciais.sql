-- Associa cargo às duas contas já existentes.
-- Pra adicionar gente nova depois, rode um INSERT parecido a este.

insert into perfis (user_id, cargo)
select id, 'garcom' from auth.users where email = 'hebertdev82@gmail.com'
union all
select id, 'cozinha' from auth.users where email = 'theseventiesburger@gmail.com'
on conflict (user_id) do update set cargo = excluded.cargo;
