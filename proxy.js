import { atualizarSessao } from '@/lib/supabase/proxySession';

export async function proxy(request) {
  return atualizarSessao(request);
}

export const config = {
  matcher: ['/comanda/:path*'],
};
