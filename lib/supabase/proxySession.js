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

  if (!user && !naLogin) {
    const url = request.nextUrl.clone();
    url.pathname = ROTA_LOGIN;
    url.searchParams.set('proximo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && naLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/comanda';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
