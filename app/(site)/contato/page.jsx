import Image from 'next/image';

const redes = [
  {
    nome: 'Instagram',
    handle: '@theseventiesburgers',
    href: 'https://www.instagram.com/theseventiesburgers',
    cor: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]',
    icone: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    nome: 'Facebook',
    handle: '/theseventies.burger',
    href: 'https://www.facebook.com/theseventies.burger/',
    cor: 'bg-[#1877F2]',
    icone: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    ),
  },
];

const horarios = [
  { dia: 'Segunda a Quinta', hora: '[horário]' },
  { dia: 'Sexta e Sábado', hora: '[horário]' },
  { dia: 'Domingo', hora: '[horário]' },
];

export default function ContatoPage() {
  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[280px] md:h-[360px] bg-sv-dark overflow-hidden flex items-center">
        <Image
          src="/hb1.png"
          alt="Fale com The Seventies Burger"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sv-dark via-sv-dark/90 to-sv-dark/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-4 block">
            Estamos por aqui 👋
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Fale com a <br />
            <span className="text-sv-red">Gente</span>
          </h1>
          <p className="text-gray-400 font-medium mt-4 max-w-sm text-sm md:text-base">
            Dúvidas, sugestões ou aquele pedido especial? Escolha o canal que preferir.
          </p>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* ── Conteúdo ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* WhatsApp — canal principal */}
          <div className="lg:col-span-2 bg-sv-dark rounded-3xl shadow-md p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white opacity-5 rounded-full pointer-events-none" />
            <div className="relative z-10 text-center md:text-left">
              <span className="text-sv-blue text-[10px] font-black tracking-widest uppercase">Resposta mais rápida</span>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mt-2">
                Chame no WhatsApp
              </h2>
              <p className="text-gray-400 text-sm font-medium mt-2 max-w-sm">
                Pedidos, dúvidas ou parcerias — nosso time responde por lá.
              </p>
            </div>
            <a
              href="https://wa.me/5535992776777"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 flex-shrink-0 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.054 23.446a.75.75 0 0 0 .925.926l5.633-1.485A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.953-1.355l-.355-.211-3.683.970.988-3.607-.232-.371A9.696 9.696 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              (35) 99277-6777
            </a>
          </div>

          {/* Redes sociais */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col justify-center gap-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Redes sociais</span>
            {redes.map((rede) => (
              <a
                key={rede.nome}
                href={rede.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${rede.cor}`}>
                  {rede.icone}
                </div>
                <div>
                  <span className="block font-black text-sv-dark text-sm uppercase tracking-wide group-hover:text-sv-blue transition-colors duration-150">
                    {rede.nome}
                  </span>
                  <span className="block text-[11px] text-gray-400 font-medium">{rede.handle}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          {/* Endereço */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-sv-red/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-sv-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-black text-sv-dark uppercase tracking-wide">Onde estamos</h3>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              [Endereço da loja — rua, número, bairro, cidade e CEP]
            </p>
          </div>

          {/* Horário */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-sv-blue/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-sv-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-black text-sv-dark uppercase tracking-wide">Horário de funcionamento</h3>
            </div>
            <div className="flex flex-col gap-2">
              {horarios.map((h) => (
                <div key={h.dia} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">{h.dia}</span>
                  <span className="text-sv-dark font-black">{h.hora}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner CTA ──────────────────────────────────────────────────────── */}
      <div className="w-full bg-sv-red text-white py-16 px-6 text-center">
        <p className="text-red-100 text-xs font-bold uppercase tracking-widest mb-3">Já sabe o que vai pedir?</p>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6">
          Confira o <span className="text-sv-dark">cardápio</span>
        </h3>
        <a
          href="/cardapio"
          className="inline-block bg-sv-dark text-white font-black px-10 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Ver Cardápio
        </a>
      </div>

    </section>
  );
}
