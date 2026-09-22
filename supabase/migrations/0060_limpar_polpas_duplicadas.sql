-- Polpas cadastradas em dobro (lote das 00:00 e lote das 05:52 do mesmo
-- dia) — cada lote acabou vinculado a um produto diferente, então não é
-- só apagar a cópia extra: "Suco de Frutas Vermelhas 300ml" estava preso
-- na cópia que vai sair, então primeiro aponta ele pra cópia que fica
-- (mesma que "Suco de Maracujá com Morango" já usa), depois apaga as 3
-- cópias órfãs (Abacaxi e Maracujá nunca tiveram produto nenhum
-- apontando pra elas). O estoque atual de cada par é idêntico (mesma
-- contagem inicial duplicada, não estoque real somado), então fica como
-- está na cópia que permanece. Rode este arquivo inteiro no SQL Editor
-- do Supabase.

update receita_itens
set insumo_id = '4686648a-5c66-4d12-962f-d302a4598e50' -- Polpa de Frutas Vermelhas (cópia que fica)
where id = 'cfe74c05-78b2-46d6-8048-d9ccc8a80d35';      -- ficha técnica de "Suco de Frutas Vermelhas 300ml"

delete from insumos
where id in (
  'cdd86b59-401b-4ef5-a023-ecd06837924f', -- Polpa de Abacaxi (cópia órfã)
  '6fa469f5-e6ae-4e37-aeb7-87124da54ee9', -- Polpa de Frutas Vermelhas (cópia órfã, já repontada acima)
  '781c66f1-18c2-49a4-94e3-ea0f794373e3'  -- Polpa de Maracujá (cópia órfã)
);
