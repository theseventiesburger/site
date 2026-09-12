const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  // App e Clube ainda não têm as regras definidas — tirados do menu e da
  // navegação por enquanto. Redirect (não delete) porque as páginas
  // continuam prontas pra quando a decisão sair; tirar isso daqui religa
  // as duas.
  async redirects() {
    return [
      { source: '/appseventies', destination: '/', permanent: false },
      { source: '/clube', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
