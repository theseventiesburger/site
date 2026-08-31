import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaSetar) {
          try {
            cookiesParaSetar.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Chamado a partir de um Server Component durante a renderização
            // (onde escrever cookies não é permitido) — o proxy.js garante
            // que a sessão é renovada em todo request, então é seguro ignorar.
          }
        },
      },
    }
  );
}
