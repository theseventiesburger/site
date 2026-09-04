-- Limpeza de overloads fantasma de criar_pedido: cada vez que a função
-- ganhou um parâmetro novo ao longo do histórico de migrations, "create or
-- replace" só substitui quando a lista de parâmetros é idêntica à
-- anterior — como cada mudança acrescentava parâmetro no fim, cada uma
-- criou uma função NOVA em vez de substituir, e a versão antiga ficou pra
-- trás no banco. Isso nunca quebrou o app (ele sempre manda todos os
-- parâmetros da versão atual, o que desambigua sozinho), mas fica ambíguo
-- pra qualquer chamada com menos parâmetros — foi assim que apareceram ao
-- testar a taxa de serviço (0027). Remove as 4 versões obsoletas, mantendo
-- só a atual (a que tem p_cupom_codigo). Rode este arquivo inteiro no SQL
-- Editor do Supabase.

drop function if exists criar_pedido(text, smallint, text, text, text, numeric, text, text, jsonb);
drop function if exists criar_pedido(text, smallint, uuid, text, text, text, numeric, text, text, jsonb);
drop function if exists criar_pedido(text, smallint, uuid, text, text, text, uuid, text, text, numeric, text, text, jsonb);
drop function if exists criar_pedido(text, smallint, uuid, text, text, text, uuid, text, text, text, numeric, text, text, jsonb);
