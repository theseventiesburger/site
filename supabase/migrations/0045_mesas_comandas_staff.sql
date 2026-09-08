-- Cliente comum (conta do site) conseguia acessar o painel da equipe:
-- proxy.js só checava "está logado", não "é da equipe" (corrigido no
-- código, lib/supabase/proxySession.js). Mas a policy de RLS por trás
-- disso também estava aberta demais — `mesas` e `comandas` ficaram de
-- fora do fechamento de segurança da 0025 (mesas é de antes, de quando
-- só atendente tinha login; comandas é de depois, e simplesmente repetiu
-- o "using (true)" antigo). Como o navegador fala direto com o Supabase
-- (sem passar pela Next.js), a RLS é a barreira que realmente importa —
-- a página só é a primeira camada. Rode este arquivo inteiro no SQL
-- Editor do Supabase.

drop policy mesas_select on mesas;
create policy mesas_select_staff on mesas for select to authenticated using (eh_staff());

drop policy comandas_select on comandas;
create policy comandas_select_staff on comandas for select to authenticated using (eh_staff());
