const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatadorHora = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

export function formatarBRL(valor) {
  return formatadorBRL.format(Number(valor) || 0);
}

export function formatarHora(dataISO) {
  return formatadorHora.format(new Date(dataISO));
}

export function tempoDecorrido(dataISO) {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(dataISO).getTime()) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h${String(minutos % 60).padStart(2, '0')}`;
}
