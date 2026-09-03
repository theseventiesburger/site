// Gera o payload "Pix Copia e Cola" (BR Code / EMV) - puro texto, sem
// depender de nenhuma API externa. Qualquer app de banco le esse codigo,
// ja com o valor preenchido.
// Referencia: manual de padroes para iniciacao do Pix (BR Code), Bacen.

function removerAcentos(texto) {
  return texto.normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
}

function campo(id, valor) {
  const tamanho = String(valor).length.toString().padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

// CRC16-CCITT (poli 0x1021, inicio 0xFFFF) - igual ao exigido pelo padrao Pix.
function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// chave: chave Pix (e-mail, telefone, CPF/CNPJ ou aleatoria)
// nome/cidade: recebedor, sem acento, cortados no limite do padrao
// valor: numero (sera formatado com 2 casas)
// txid: identificador do pedido (so alfanumerico, ate 25 chars - "***" se nao tiver)
export function gerarPixCopiaECola({ chave, nome, cidade, valor, txid }) {
  const nomeLimpo = removerAcentos(nome || '').toUpperCase().slice(0, 25);
  const cidadeLimpa = removerAcentos(cidade || '').toUpperCase().slice(0, 15);
  const txidLimpo = (txid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  const merchantAccountInfo = campo('00', 'BR.GOV.BCB.PIX') + campo('01', chave);

  const partes = [
    campo('00', '01'), // Payload Format Indicator
    campo('01', '12'), // Point of Initiation (codigo de uso unico)
    campo('26', merchantAccountInfo),
    campo('52', '0000'), // Merchant Category Code
    campo('53', '986'), // Moeda: BRL
    campo('54', Number(valor).toFixed(2)),
    campo('58', 'BR'),
    campo('59', nomeLimpo || 'THE SEVENTIES'),
    campo('60', cidadeLimpa || 'SAO LOURENCO'),
    campo('62', campo('05', txidLimpo)),
  ];

  const semCrc = partes.join('') + '6304';
  return semCrc + crc16(semCrc);
}
