'use client'

export default function BentoTechComingSoon() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 p-4 font-sans select-none overflow-y-auto selection:bg-zinc-800 selection:text-emerald-400">
      
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto md:auto-rows-[140px] relative z-10 my-auto py-8 md:py-0">
        
        <div className="md:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between gap-4 md:gap-0 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase">Status</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">18.7%</div>
            <p className="text-[11px] text-zinc-500 font-medium">Ambiente de produção compilado</p>
          </div>
        </div>

        <div className="md:col-span-2 md:row-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 flex flex-col justify-between gap-6 md:gap-0 backdrop-blur-sm shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-15" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2.5 py-1 text-[10px] font-mono font-medium text-emerald-400 border border-zinc-700/50">
              $ npm run deploy
            </span>
          </div>

          <div className="space-y-3 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight md:leading-none">
              Construindo o <br />
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                futuro da plataforma.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed font-medium">
              Estamos reescrevendo nossa arquitetura do zero para entregar uma experiência extremamente veloz, limpa e segura.
            </p>
          </div>
        </div>

        <div className="md:col-span-1 md:row-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between gap-4 md:gap-0 backdrop-blur-sm shadow-xl overflow-hidden relative">
          <div className="text-xs font-mono tracking-wider text-zinc-500 uppercase">Source Code</div>
          
          <div className="font-mono text-[10px] text-zinc-600 space-y-1.5 my-2 md:my-4 blur-[1px] select-none pointer-events-none opacity-60">
            <p className="text-emerald-500/80">import &#123; supabase &#125; from './client';</p>
            <p>export async function init() &#123;</p>
            <p className="pl-3 text-zinc-400">const &#123; data, error &#125; = await</p>
            <p className="pl-6">supabase.from('system').select('*')</p>
            <p className="pl-3 text-zinc-500">// otimizando pacotes v4...</p>
            <p className="pl-3">if (error) throw new Error(error);</p>
            <p>&#125;</p>
            <p className="text-zinc-500">export default init;</p>
          </div>

          <div className="border-t border-zinc-800/80 pt-3">
            <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stack: Next.js + Tailwind v4
            </div>
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-xl font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="text-zinc-600 hidden sm:inline">&lt;/&gt;</span>
            <span>© {new Date().getFullYear()} • Rixxer</span>
          </div>

          <div className="flex items-center gap-4 select-text">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 pointer-events-none hidden xs:inline">Connect:</span>
            
            <a 
              href="https://wa.me/5535984265018" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-500 hover:text-green-400 transition-colors duration-200"
              title="WhatsApp"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.66.986 3.288 1.488 5.273 1.489 5.34 0 9.685-4.346 9.688-9.691.002-2.592-1.003-5.029-2.831-6.859-1.828-1.829-4.258-2.836-6.86-2.837-5.346 0-9.69 4.345-9.693 9.693-.001 2.02.531 3.61 1.484 5.256L2.693 21.32l5.074-1.332zm11.393-7.464c-.3-.149-1.774-.875-2.04-.972-.268-.099-.463-.149-.658.149-.195.299-.754.972-.925 1.166-.17.194-.339.219-.639.07-1.442-.619-2.42-1.246-3.38-2.898-.25-.429.25-.399.715-1.324.075-.15.037-.282-.019-.396-.056-.113-.463-1.117-.634-1.529-.166-.399-.333-.344-.462-.351-.119-.006-.256-.008-.393-.008-.137 0-.361.051-.55.258-.19.206-.722.706-.722 1.722 0 1.017.74 2.004.843 2.142.103.137 1.455 2.221 3.525 3.116.493.213.878.34 1.179.436.496.157.949.135 1.306.081.399-.06 1.774-.726 2.023-1.426.249-.699.249-1.299.174-1.426-.075-.127-.27-.201-.569-.349z"/>
              </svg>
            </a>

            <a 
              href="https://www.linkedin.com/company/rixxerbr/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors duration-200"
              title="LinkedIn"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>

            <a 
              href="https://www.instagram.com/rixxerbr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors duration-200"
              title="Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            <a 
              href="https://www.facebook.com/rixxerbr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors duration-200"
              title="Facebook"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}