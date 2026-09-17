-- Reverte 0052_nota_fiscal.sql. Decisão: em vez do Focus NFe (pago, a
-- partir de R$ 59,90/mês), a emissão de NFC-e vai ficar por fora do
-- sistema, no emissor gratuito da Myrp/Fecomércio MG — não tem API pra
-- integrar, então as colunas ficaram sem uso. Além disso ainda está em
-- aberto com o contador se MEI em MG realmente precisa emitir NFC-e pra
-- consumidor final ou fica dispensado. Rode este arquivo inteiro no SQL
-- Editor do Supabase.

alter table produtos drop column nfce_ncm;
alter table produtos drop column nfce_cfop;
alter table produtos drop column nfce_csosn;

alter table pedidos drop column nfce_status;
alter table pedidos drop column nfce_referencia;
alter table pedidos drop column nfce_chave;
alter table pedidos drop column nfce_numero;
alter table pedidos drop column nfce_serie;
alter table pedidos drop column nfce_danfe_url;
alter table pedidos drop column nfce_qrcode_url;
alter table pedidos drop column nfce_erro;
alter table pedidos drop column nfce_emitida_em;
