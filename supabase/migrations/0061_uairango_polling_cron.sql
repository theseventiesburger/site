-- Polling de pedidos do UaiRango a cada 30 segundos. O webhook não tem
-- como ser cadastrado no portal deles (a tela do app não tem campo pra
-- URL), então o Supabase chama /api/uairango/polling de tempos em tempos
-- (pg_cron agenda, pg_net faz a chamada HTTP) e a rota busca os eventos,
-- cria os pedidos e confirma (ack) os processados.
--
-- ATENÇÃO: troque COLE_O_SEGREDO_AQUI pelo mesmo valor da env
-- UAIRANGO_POLLING_SECRET da Vercel antes de rodar — o segredo não fica
-- gravado neste arquivo de propósito. Rode no SQL Editor do Supabase.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'uairango-polling',
  '30 seconds',
  $$
  select net.http_post(
    url := 'https://www.theseventiesburger.com.br/api/uairango/polling',
    headers := jsonb_build_object('x-cron-secret', 'COLE_O_SEGREDO_AQUI', 'Content-Type', 'application/json')
  );
  $$
);

-- Pra pausar depois:   select cron.unschedule('uairango-polling');
