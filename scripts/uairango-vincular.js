// Vinculação inicial com o UaiRango Connect — roda uma vez só, na mão,
// depois que a homologação sair e você tiver clientId/clientSecret.
//
// Passo 1 — pega o link de conexão:
//   node --env-file=.env.local scripts/uairango-vincular.js iniciar
// Abra o link que aparecer, entre no Portal de Estabelecimento, clique em
// "Conectar" e copie o authorizationCode que aparecer na tela.
//
// Passo 2 — troca o código pelo token de acesso:
//   node --env-file=.env.local scripts/uairango-vincular.js concluir <authorizationCode>
// (o authorizationCodeVerifier do passo 1 é reaproveitado automaticamente)

const { createClient } = require('@supabase/supabase-js');

const BASE_URL = 'https://merchant-api.uairango.com';
const ARQUIVO_VERIFICADOR = require('node:path').join(__dirname, '.uairango-verifier.tmp');

function headerAmbiente() {
  return { 'x-env': process.env.UAIRANGO_ENV || 'production' };
}

async function iniciar() {
  const resposta = await fetch(`${BASE_URL}/authentication/v1.0/oauth/userCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headerAmbiente() },
    body: JSON.stringify({ clientId: process.env.UAIRANGO_CLIENT_ID }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao iniciar vinculação (${resposta.status}): ${await resposta.text()}`);
  }

  const dados = await resposta.json();
  require('node:fs').writeFileSync(ARQUIVO_VERIFICADOR, dados.authorizationCodeVerifier);

  console.log('Abra esse link e clique em "Conectar":');
  console.log(dados.verificationUrlComplete);
  console.log(`\nExpira em ${dados.expiresIn} segundos.`);
}

async function concluir(authorizationCode) {
  if (!authorizationCode) {
    console.error('Uso: node scripts/uairango-vincular.js concluir <authorizationCode>');
    process.exit(1);
  }

  const authorizationCodeVerifier = require('node:fs').readFileSync(ARQUIVO_VERIFICADOR, 'utf8').trim();

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
    throw new Error(`Falha ao trocar código por token (${resposta.status}): ${await resposta.text()}`);
  }

  const dados = await resposta.json();
  const expiresAt = new Date(Date.now() + (dados.expiresIn - 300) * 1000).toISOString();

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabaseAdmin
    .from('uairango_auth')
    .upsert({ id: 1, access_token: dados.accessToken, refresh_token: dados.refreshToken ?? null, expires_at: expiresAt });
  if (error) throw error;

  require('node:fs').unlinkSync(ARQUIVO_VERIFICADOR);
  console.log('Vinculado! Token salvo em uairango_auth — o webhook já pode usar a API.');
}

const comando = process.argv[2];
if (comando === 'iniciar') iniciar().catch((err) => { console.error(err); process.exit(1); });
else if (comando === 'concluir') concluir(process.argv[3]).catch((err) => { console.error(err); process.exit(1); });
else {
  console.log('Uso:');
  console.log('  node scripts/uairango-vincular.js iniciar');
  console.log('  node scripts/uairango-vincular.js concluir <authorizationCode>');
}
