const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatadorHora = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

const formatadorDataCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

const formatadorDataISO = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
});

// Sem timeZone: 'YYYY-MM-DD' vira meia-noite UTC, e formatar em
// America/Sao_Paulo voltaria pro dia anterior. Usado só pra datas puras
// (sem hora), como data de nascimento.
const formatadorDataPura = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatarBRL(valor) {
  return formatadorBRL.format(Number(valor) || 0);
}

// Aceita tanto "1,50" (vírgula, do jeito que a gente digita) quanto "1.50".
export function parsePrecoInput(valor) {
  if (typeof valor !== 'string') return Number(valor) || 0;
  const numero = Number(valor.trim().replace(',', '.'));
  return Number.isFinite(numero) ? numero : 0;
}

export function formatarHora(dataISO) {
  return formatadorHora.format(new Date(dataISO));
}

export function formatarDataHora(dataISO) {
  return formatadorDataHora.format(new Date(dataISO));
}

export function formatarDataCurta(dataISO) {
  return formatadorDataCurta.format(new Date(dataISO));
}

export function formatarDataNascimento(dataISO) {
  if (!dataISO) return null;
  return formatadorDataPura.format(new Date(`${dataISO}T00:00:00Z`));
}

// YYYY-MM-DD de hoje no fuso de São Paulo — usado como padrão dos filtros
// de relatório (o servidor pode estar rodando em UTC).
export function dataHojeSP() {
  return formatadorDataISO.format(new Date());
}

// YYYY-MM-DD de N dias atrás, no fuso de São Paulo.
export function dataAtrasSP(dias) {
  const agora = new Date();
  agora.setUTCDate(agora.getUTCDate() - dias);
  return formatadorDataISO.format(agora);
}

// Máscara progressiva de telefone BR — (35) 3241-2233 (fixo) ou
// (35) 99277-6777 (celular), conforme a quantidade de dígitos digitados.
export function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

// Máscara progressiva de data dd/mm/aaaa (exibição em texto puro — o
// <input type="date"> nativo segue o locale do navegador, não dá pra
// forçar formato BR nele).
export function formatarDataDigitada(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  const partes = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4, 8)].filter(Boolean);
  return partes.join('/');
}

// "dd/mm/aaaa" completo -> "aaaa-mm-dd" (formato de coluna date do
// Postgres). Retorna null enquanto a data não estiver completa.
export function dataDigitadaParaISO(dataBR) {
  const digitos = dataBR.replace(/\D/g, '');
  if (digitos.length !== 8) return null;
  const dia = digitos.slice(0, 2);
  const mes = digitos.slice(2, 4);
  const ano = digitos.slice(4, 8);
  return `${ano}-${mes}-${dia}`;
}

// "aaaa-mm-dd" -> "dd/mm/aaaa", pra preencher o campo mascarado ao editar
// um cadastro existente.
export function isoParaDataDigitada(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function tempoDecorrido(dataISO) {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(dataISO).getTime()) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h${String(minutos % 60).padStart(2, '0')}`;
}
