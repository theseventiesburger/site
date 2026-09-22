-- Habilita realtime em `insumos` — o alerta de estoque baixo na tela de
-- Estoque escuta mudanças na tabela pra atualizar sozinho quando a baixa
-- automática de uma venda derruba algum insumo abaixo do mínimo, sem
-- precisar dar F5. Rode este arquivo inteiro no SQL Editor do Supabase.

alter publication supabase_realtime add table insumos;
