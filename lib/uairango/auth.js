// Autenticação OAuth2 do UaiRango Connect — nunca chamado do navegador (só
// server-side: webhook e scripts de vinculação), token fica só no banco
// (tabela uairango_auth, sem policy nenhuma — só o service role acessa).
//
// Fluxo (app "Distribuído", uma loja só):
// 1. iniciarVinculacao() — gera userCode + link, feito uma vez só.
// 2. Você abre o link, conecta no portal do estabelecimento, copia o
//    authorizationCode que aparece na tela.
// 3. concluirVinculacao(authorizationCode, authorizationCodeVerifier) troca
//    esse código pelo primeiro accessToken/refreshToken e salva no banco.
// Depois disso, obterTokenValido() cuida sozinho de renovar quando expira
// (token dura 6h, refresh token 168h).
//
// Aviso: o grantType exato pra trocar o authorizationCode não veio 100%
// explícito na documentação (só o exemplo com client_credentials está
// completo) — testar contra o ambiente de desenvolvimento deles
// (x-env: development) antes de ir pra produção.

const BASE_URL = 'https://merchant-api.uairango.com';

function headerAmbiente() {
  return { 'x-env': process.env.UAIRANGO_ENV || 'production' };
}

export async function iniciarVinculacao() {
  const resposta = await fetch(`${BASE_URL}/authentication/v1.0/oauth/userCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headerAmbiente() },
    body: JSON.stringify({ clientId: process.env.UAIRANGO_CLIENT_ID }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao iniciar vinculação (${resposta.status}): ${await resposta.text()}`);
  }

  return resposta.json(); // { userCode, authorizationCodeVerifier, verificationUrlComplete, expiresIn }
}

export async function concluirVinculacao(supabaseAdmin, authorizationCode, authorizationCodeVerifier) {
  const resposta = await fetch(`${BASE_URL}/authentication/v1.0/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headerAmbiente() },
    body: new URLSearchParams({
      grantType: 'authorization_code',
      clientId: process.env.UAIRANGO_CLIENT_ID,
      clientSecret: process.env.UAIRANGO_CLIENT_SECRET,
      authorizationCode,
      authorizationCodeVerifier,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao concluir vinculação (${resposta.status}): ${await resposta.text()}`);
  }

  const dados = await resposta.json(); // { accessToken, refreshToken?, expiresIn }
  await salvarToken(supabaseAdmin, dados);
  return dados;
}

async function salvarToken(supabaseAdmin, { accessToken, refreshToken, expiresIn }) {
  // Renova com 5min de folga antes do vencimento real, pra nunca usar um
  // token que expira no meio de uma chamada.
  const expiresAt = new Date(Date.now() + (expiresIn - 300) * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from('uairango_auth')
    .upsert({ id: 1, access_token: accessToken, refresh_token: refreshToken ?? null, expires_at: expiresAt });

  if (error) throw error;
}

async function renovarToken(supabaseAdmin, refreshToken) {
  const resposta = await fetch(`${BASE_URL}/authentication/v1.0/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headerAmbiente() },
    body: new URLSearchParams({
      grantType: 'refresh_token',
      clientId: process.env.UAIRANGO_CLIENT_ID,
      clientSecret: process.env.UAIRANGO_CLIENT_SECRET,
      refreshToken,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao renovar token (${resposta.status}): ${await resposta.text()}`);
  }

  const dados = await resposta.json();
  await salvarToken(supabaseAdmin, dados);
  return dados.accessToken;
}

// Devolve um accessToken válido, renovando sozinho quando precisa —
// chamar isso antes de qualquer request pra API do UaiRango.
export async function obterTokenValido(supabaseAdmin) {
  const { data: registro, error } = await supabaseAdmin.from('uairango_auth').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;

  if (!registro) {
    throw new Error('UaiRango ainda não foi vinculado — rode o script de vinculação primeiro.');
  }

  if (new Date(registro.expires_at) > new Date()) {
    return registro.access_token;
  }

  if (!registro.refresh_token) {
    throw new Error('Token do UaiRango expirou e não há refresh_token salvo — vincule de novo.');
  }

  return renovarToken(supabaseAdmin, registro.refresh_token);
}
