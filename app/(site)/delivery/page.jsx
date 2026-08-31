import Image from 'next/image';

const passos = [
  {
    numero: '01',
    titulo: 'Monte seu pedido',
    desc: 'Dá uma olhada no cardápio e escolha seus hambúrgueres, combos e bebidas favoritos.',
  },
  {
    numero: '02',
    titulo: 'Chame no WhatsApp',
    desc: 'Envie sua lista pelo WhatsApp e confirme o endereço de entrega com nosso time.',
  },
  {
    numero: '03',
    titulo: 'Receba quentinho',
    desc: 'Acompanhe a preparação e receba seu pedido fresquinho, direto na sua porta.',
  },
];

export default function DeliveryPage() {
  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[320px] md:h-[420px] bg-[#990B0B] overflow-hidden">
        <Image
          src="/hb2.png"
          alt="Delivery The Seventies Burger"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#730808] via-[#990B0B]/85 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          <span className="text-white text-xs font-black tracking-[0.3em] uppercase mb-4">
            Direto na sua casa 🛵
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Delivery <br />
            <span className="text-sv-dark">The Seventies</span>
          </h1>
          <p className="text-red-100 font-medium mt-4 max-w-sm text-sm md:text-base">
            O mesmo sabor de sempre, sem sair de casa. Peça pelo canal que preferir.
          </p>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* ── Canal principal: WhatsApp ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16">
        <div className="bg-sv-dark rounded-3xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mb-6">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-white opacity-5 rounded-full pointer-events-none" />

          <div className="relative z-10 text-center md:text-left">
            <span className="inline-block bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Peça direto com a gente
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Peça pelo <br className="hidden md:block" /> WhatsApp
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium mt-4 max-w-md">
              Sem taxa de plataforma e atendimento rápido com nosso time. É só chamar e montar seu pedido.
            </p>
          </div>

          <a
            href="https://wa.me/5535992776777"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex-shrink-0 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black px-10 py-5 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.054 23.446a.75.75 0 0 0 .925.926l5.633-1.485A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.953-1.355l-.355-.211-3.683.970.988-3.607-.232-.371A9.696 9.696 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
            </svg>
            Chamar no WhatsApp
          </a>
        </div>

        {/* Canal secundário: UaiRango */}
        <a
          href="https://www.uairango.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-md border border-gray-100 p-5 md:p-6 mb-16 hover:border-sv-blue transition-colors duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm relative bg-[#F7F7F7]">
              <Image src="/uairango.png" alt="UaiRango" fill className="object-contain p-1.5" />
            </div>
            <div>
              <span className="block font-black text-sv-dark text-sm uppercase tracking-wide group-hover:text-sv-blue transition-colors duration-150">
                Prefere um app de delivery?
              </span>
              <span className="block text-xs text-gray-400 font-medium">Também estamos no UaiRango</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-sv-blue transition-colors duration-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>

        {/* ── Como funciona ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center text-center mb-12 space-y-4">
          <h3 className="text-3xl md:text-4xl font-black text-sv-dark tracking-tighter uppercase">
            Como funciona
          </h3>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {passos.map((passo) => (
            <div
              key={passo.numero}
              className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 relative"
            >
              <span className="text-6xl font-black text-[#F7F7F7] absolute top-4 right-6 select-none">
                {passo.numero}
              </span>
              <h4 className="relative text-xl font-black text-sv-dark uppercase tracking-tight mb-3">
                {passo.titulo}
              </h4>
              <p className="relative text-gray-500 text-sm font-medium leading-relaxed">
                {passo.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Área e horário de entrega ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-sv-red/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-sv-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-black text-sv-dark uppercase tracking-wide">Área de entrega</h3>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              [Bairros/raio de entrega — confirme sua região direto no WhatsApp]
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-sv-blue/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-sv-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-black text-sv-dark uppercase tracking-wide">Horário de entrega</h3>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              [Horário de funcionamento do delivery]
            </p>
          </div>
        </div>
      </div>

      {/* ── Banner CTA ──────────────────────────────────────────────────────── */}
      <div className="w-full bg-sv-dark text-white py-16 px-6 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Ainda não escolheu?</p>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6">
          Dá uma olhada no <span className="text-sv-red">cardápio</span>
        </h3>
        <a
          href="/cardapio"
          className="inline-block bg-sv-red text-white font-black px-10 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Ver Cardápio
        </a>
      </div>

    </section>
  );
}
