// Chamada HTTP pra Focus NFe. Ambiente (homologação/produção) e o token
// correspondente vêm de env vars — a Focus usa token diferente por
// ambiente, não é só trocar a URL base.

const URLS = {
  homologacao: 'https://homologacao.focusnfe.com.br',
  producao: 'https://api.focusnfe.com.br',
};

export function ambienteFocusNfe() {
  return process.env.FOCUSNFE_AMBIENTE === 'producao' ? 'producao' : 'homologacao';
}

function token() {
  const ambiente = ambienteFocusNfe();
  const valor = ambiente === 'producao'
    ? process.env.FOCUSNFE_TOKEN_PRODUCAO
    : process.env.FOCUSNFE_TOKEN_HOMOLOGACAO;

  if (!valor) {
    throw new Error(`FOCUSNFE_TOKEN_${ambiente.toUpperCase()} não configurado.`);
  }
  return valor;
}

// NFC-e é síncrona: a Focus responde 201 tanto quando a SEFAZ autoriza
// quanto quando rejeita — o status real vem no campo `status` do corpo.
// Só HTTP 4xx é erro de requisição de verdade (token errado, payload
// inválido, ref repetida etc).
export async function chamarFocusNfe(caminho, opcoes = {}) {
  const auth = Buffer.from(`${token()}:`).toString('base64');

  const resposta = await fetch(`${URLS[ambienteFocusNfe()]}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      ...opcoes.headers,
    },
  });

  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    const mensagem = corpo?.mensagem || corpo?.erros?.[0]?.mensagem || corpo?.codigo || `Focus NFe: HTTP ${resposta.status}`;
    const erro = new Error(mensagem);
    erro.codigo = corpo?.codigo;
    erro.status = resposta.status;
    throw erro;
  }

  return { status: resposta.status, corpo };
}
