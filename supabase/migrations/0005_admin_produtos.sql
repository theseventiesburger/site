-- Admin de produtos: leitura pública do cardápio ativo, escrita pela
-- equipe logada, e bucket de imagens no Storage.

create policy produtos_select_publico on produtos
  for select to anon
  using (ativo = true);

create policy produtos_insert on produtos
  for insert to authenticated
  with check (true);

create policy produtos_update on produtos
  for update to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy produtos_storage_select on storage.objects
  for select to public
  using (bucket_id = 'produtos');

create policy produtos_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'produtos');

create policy produtos_storage_update on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos')
  with check (bucket_id = 'produtos');
