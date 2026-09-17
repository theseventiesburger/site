-- Nota Fiscal do Consumidor Eletrônica (NFC-e) via gateway Focus NFe.
-- A emissão em si roda fora do banco (lib/nfce/), aqui só guarda a
-- configuração fiscal por produto e o resultado por pedido.
--
-- Escopo desta primeira versão: uma NFC-e por linha de `pedidos` (cada
-- rodada de mesa vira uma nota própria, em vez de consolidar a conta
-- inteira da mesa numa nota só) — mantém a emissão simples e reaproveita
-- a mesma tela/fluxo que mesa, pdv e delivery já têm em comum (relatório +
-- ModalDetalhePedido). Se no futuro precisar de uma nota por conta fechada
-- de mesa, revisitar isso.
--
-- ncm/cfop ficam em branco por padrão: a emissão falha com erro claro se
-- faltar em algum item do pedido, em vez de mandar pra SEFAZ um código
-- chutado. csosn já nasce com '102' (tributado pelo Simples/MEI, sem
-- direito a crédito de ICMS) por ser MEI, mas fica editável por produto
-- pro contador ajustar se algum item precisar de outro código.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

alter table produtos add column nfce_ncm text;
alter table produtos add column nfce_cfop text;
alter table produtos add column nfce_csosn text not null default '102';

alter table pedidos add column nfce_status text check (nfce_status in ('pendente','processando','autorizada','erro','cancelada'));
alter table pedidos add column nfce_referencia text unique;
alter table pedidos add column nfce_chave text;
alter table pedidos add column nfce_numero text;
alter table pedidos add column nfce_serie text;
alter table pedidos add column nfce_danfe_url text;
alter table pedidos add column nfce_qrcode_url text;
alter table pedidos add column nfce_erro text;
alter table pedidos add column nfce_emitida_em timestamptz;
