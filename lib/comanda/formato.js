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

export function tempoDecorrido(dataISO) {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(dataISO).getTime()) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h${String(minutos % 60).padStart(2, '0')}`;
}
