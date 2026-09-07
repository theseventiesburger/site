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

const formatadorHoraNumerica = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  hourCycle: 'h23',
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

// Hora do dia (0-23) no fuso de São Paulo — usado pra agrupar vendas por
// hora no relatório (gráfico de tendência de um dia só).
export function horaDoDia(dataISOouTimestamp) {
  return Number(formatadorHoraNumerica.format(new Date(dataISOouTimestamp)));
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

// Soma dias a uma data "YYYY-MM-DD" sem passar por conversão de fuso —
// Date.UTC evita o problema de "meia-noite UTC formatada em SP volta um
// dia" (mesmo caso documentado em formatarDataNascimento).
export function somarDiasISO(dataISO, dias) {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
  const anoSaida = data.getUTCFullYear();
  const mesSaida = String(data.getUTCMonth() + 1).padStart(2, '0');
  const diaSaida = String(data.getUTCDate()).padStart(2, '0');
  return `${anoSaida}-${mesSaida}-${diaSaida}`;
}

// "Dia comercial" que um instante pertence, considerando que o dia vira às
// `horaVirada` horas em vez de meia-noite — pensado pra hamburgueria que
// fecha depois da meia-noite não ter pedido de madrugada contado como
// "dia seguinte" no relatório. horaVirada=0 é o comportamento normal
// (equivale à data de calendário).
export function diaComercialDe(dataISOouTimestamp, horaVirada = 0) {
  const instante = new Date(new Date(dataISOouTimestamp).getTime() - horaVirada * 3600000);
  return formatadorDataISO.format(instante);
}

// Dia comercial de agora, e de N dias comerciais atrás — mesma ideia de
// dataHojeSP/dataAtrasSP, mas deslocada pela virada.
export function diaComercialAtual(horaVirada = 0) {
  return diaComercialDe(new Date(), horaVirada);
}

export function diaComercialAtras(dias, horaVirada = 0) {
  const agora = new Date(Date.now() - horaVirada * 3600000);
  agora.setUTCDate(agora.getUTCDate() - dias);
  return formatadorDataISO.format(agora);
}

// Início (inclusivo) e fim (exclusivo) do dia comercial `dataISO`, como
// timestamps prontos pra usar em `.gte()`/`.lt()` — de HH:00 desse dia até
// HH:00 do dia seguinte, em vez de meia-noite a meia-noite.
export function limitesDiaComercial(dataISO, horaVirada = 0) {
  const hora = String(horaVirada).padStart(2, '0');
  return {
    inicio: `${dataISO}T${hora}:00:00-03:00`,
    fim: `${somarDiasISO(dataISO, 1)}T${hora}:00:00-03:00`,
  };
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

export function minutosDecorridos(dataISO) {
  return Math.max(0, Math.floor((Date.now() - new Date(dataISO).getTime()) / 60000));
}

export function tempoDecorrido(dataISO) {
  const minutos = minutosDecorridos(dataISO);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h${String(minutos % 60).padStart(2, '0')}`;
}
