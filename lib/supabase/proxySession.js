import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const ROTA_LOGIN = '/comanda/login';

export async function atualizarSessao(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaSetar) {
          cookiesParaSetar.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesParaSetar.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const naLogin = pathname === ROTA_LOGIN;

  // Login pelo site (conta de cliente comum) também passa por auth.getUser()
  // com sucesso — sem essa checagem, qualquer cliente logado no site
  // conseguia entrar no painel da equipe. Só quem tem linha em `perfis`
  // (garçom/cozinha) é considerado da equipe (mesmo critério de eh_staff(),
  // ver migration 0024).
  let ehStaff = false;
  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    ehStaff = perfil != null;
  }

  if ((!user || !ehStaff) && !naLogin) {
    const url = request.nextUrl.clone();
    url.pathname = ROTA_LOGIN;
    url.searchParams.set('proximo', pathname);
    // Conta existe e está logada, só não é da equipe — mensagem diferente de
    // "não está logado", senão parece que o login simplesmente não colou.
    if (user && !ehStaff) url.searchParams.set('erro', 'sem_permissao');
    return NextResponse.redirect(url);
  }

  if (user && ehStaff && naLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/comanda';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
