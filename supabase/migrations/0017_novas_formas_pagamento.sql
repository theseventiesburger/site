-- pedidos.forma_pagamento tinha um check restringindo aos 5 valores
-- originais — sem isso, salvar "vale_refeicao" ou "fiado" seria rejeitado
-- pelo banco (com o UPDATE otimista já aplicado na tela, ficaria parecendo
-- que salvou quando na verdade não salvou nada).
-- Rode este arquivo inteiro no SQL Editor do Supabase.

alter table pedidos drop constraint if exists pedidos_forma_pagamento_check;

alter table pedidos add constraint pedidos_forma_pagamento_check
  check (forma_pagamento in ('dinheiro', 'pix', 'credito', 'debito', 'online', 'vale_refeicao', 'fiado'));
