'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Dados ────────────────────────────────────────────────────────────────────
const vantagens = [
  {
    emoji: '🎫',
    titulo: 'Cupons Exclusivos',
    descricao: 'Fica entre nós, mas os maiores e melhores descontos estão no nosso app.',
  },
  {
    emoji: '🔒',
    titulo: 'Prático e Seguro',
    descricao: 'Faça seu cadastro uma única vez e use sempre, sem se preocupar.',
  },
  {
    emoji: '⚡',
    titulo: 'Retire Sem Filas',
    descricao: 'Pague pelo app e retire no balcão ou drive-thru sem esperar.',
  },
  {
    emoji: '👑',
    titulo: 'Clube de Pontos',
    descricao: 'Acumule pontos em cada pedido e troque por hambúrgueres grátis.',
  },
];

const passos = [
  {
    numero: '01',
    titulo: 'Baixe o App',
    descricao: 'Um único cadastro para aproveitar todos os benefícios. Sempre acumulando pontos, é claro.',
    emoji: '📲',
  },
  {
    numero: '02',
    titulo: 'Escolha seu Favorito',
    descricao: 'Cardápio completo com descontos, combos, adicionais e ofertas exclusivas.',
    emoji: '🍔',
  },
  {
    numero: '03',
    titulo: 'Pague pelo App',
    descricao: 'Fácil, rápido e seguro — PIX, carteiras digitais ou cartão.',
    emoji: '💳',
  },
  {
    numero: '04',
    titulo: 'Retire e Aproveite',
    descricao: 'Toque em "Produzir Pedido" e retire sem filas no balcão ou drive-thru.',
    emoji: '🏃',
  },
];

const faqs = [
  {
    pergunta: 'Como pedir e retirar pelo App?',
    resposta: 'Selecione o produto, escolha o restaurante e finalize o pagamento. Quando chegar, toque em "Produzir Pedido" e aguarde seu nome ser chamado no balcão.',
  },
  {
    pergunta: 'Preciso esperar na fila depois de pedir pelo App?',
    resposta: 'Não! Depois de fazer seu pedido, é só produzir e aguardar seu nome ser chamado diretamente no balcão, sem enfrentar nenhuma fila.',
  },
  {
    pergunta: 'Posso usar cupons pelo App?',
    resposta: 'Sim! Temos cupons exclusivos no app com ofertas incríveis. Você pode resgatar quantos quiser, desde que haja estoque disponível.',
  },
  {
    pergunta: 'Posso trocar ingredientes pelo App?',
    resposta: 'Sim. Você pode adicionar ou remover ingredientes conforme preferir no momento do pedido.',
  },
  {
    pergunta: 'Como cancelar um pedido?',
    resposta: 'Se o pedido ainda não foi produzido, clique em "Cancelar Compra" na tela de detalhes. Se já estiver em produção, entre em contato pelo nosso WhatsApp.',
  },
  {
    pergunta: 'Tem delivery pelo App?',
    resposta: 'Em breve! Por enquanto o app é para retirada no balcão ou drive-thru. Para delivery, entre em contato pelo nosso WhatsApp.',
  },
];

// ─── Componente FAQ ───────────────────────────────────────────────────────────
function FaqItem({ item }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-black text-sv-dark uppercase tracking-tight text-sm md:text-base group-hover:text-sv-blue transition-colors duration-200">
          {item.pergunta}
        </span>
        <span className={`ml-4 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300
          ${aberto ? 'bg-sv-red text-white rotate-45' : 'bg-gray-100 text-sv-dark'}
        `}>
          +
        </span>
      </button>
      {aberto && (
        <p className="pb-5 text-gray-500 text-sm font-medium leading-relaxed -mt-2">
          {item.resposta}
        </p>
      )}
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function AppPage() {
  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

      {/* Hero */}
      <div className="relative w-full min-h-[520px] md:min-h-[600px] bg-sv-dark overflow-hidden flex items-center">
        <Image src="/hb2.png" alt="App The 70s" fill className="object-cover opacity-10" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-sv-dark via-sv-dark/90 to-sv-dark/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-20">
          <div>
            <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-5 block">
              Clube de Vantagens 🚀
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">
              Baixe nosso <br />
              <span className="text-sv-red">App</span> e tenha <br />
              os anos 70 <br />
              na palma da mão!
            </h1>
            <p className="text-gray-400 font-medium mt-6 max-w-md text-base leading-relaxed">
              Cupons exclusivos, pedidos sem fila, acúmulo de pontos e muito mais. Tudo num único lugar.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a href="https://www.apple.com/br/app-store/" target="_blank" rel="noopener noreferrer"
                className="bg-black hover:bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-3 flex items-center gap-3 transition-all duration-200 shadow-xl hover:scale-105 w-44">
                <svg className="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.27-.56 2.94-1.43z" />
                </svg>
                <div className="text-left flex flex-col leading-tight">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Disponível na</span>
                  <span className="text-sm font-black tracking-tight">App Store</span>
                </div>
              </a>
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
                className="bg-black hover:bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-3 flex items-center gap-3 transition-all duration-200 shadow-xl hover:scale-105 w-44">
                <svg className="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.783 12 3.609 22.186A2.238 2.238 0 0 1 3 20.583V3.417a2.238 2.238 0 0 1 .609-1.603zm11.29 9.07l3.292-1.902c.86-.497.86-1.312 0-1.809l-3.292-1.902-3.025 3.025 3.025 3.025zm-4.14-4.14L3.987 2.115A1.336 1.336 0 0 1 4.796 2c.381 0 .753.104 1.08.3l8.033 4.636-3.15 3.15zm0 10.512l3.15 3.15-8.033 4.636a2.13 2.13 0 0 1-1.08.3c-.287 0-.57-.04-.829-.115l6.792-4.633z" />
                </svg>
                <div className="text-left flex flex-col leading-tight">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Disponível no</span>
                  <span className="text-sm font-black tracking-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Mockup celular */}
          <div className="w-full flex justify-center">
            <div className="w-[260px] h-[520px] bg-[#1A1A1A] rounded-[40px] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-4 border-gray-800 relative">
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20" />
              <div className="w-full h-full bg-[#1A1A1A] rounded-[32px] overflow-hidden relative flex flex-col justify-between p-4 pt-10">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="font-black text-sm tracking-wider text-sv-blue">THE 70S APP</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="my-auto space-y-4 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cupom Ativo 🎫</p>
                  <h5 className="text-lg font-black tracking-tight leading-tight text-white">BATATA RÚSTICA GRÁTIS</h5>
                  <div className="w-full h-36 relative my-2">
                    <Image src="/hb2.png" alt="Burger no App" fill className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]" />
                  </div>
                  <p className="text-[10px] text-gray-400 px-2 leading-relaxed">
                    Na primeira compra pelo app. Válido por tempo limitado.
                  </p>
                </div>
                <div className="w-full bg-sv-blue text-white text-center py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
                  Resgatar Cupom
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* Vantagens */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center mb-14 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter">Vantagens Exclusivas</h2>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vantagens.map((v, i) => (
            <div key={i} className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              <span className="text-4xl mb-4">{v.emoji}</span>
              <h3 className="text-base font-black text-sv-dark uppercase tracking-tight mb-2 group-hover:text-sv-blue transition-colors duration-200">{v.titulo}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">{v.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Como Funciona */}
      <div className="w-full bg-sv-dark py-24 px-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white opacity-5 rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-14 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Como Funciona?</h2>
            <div className="w-24 h-1.5 bg-sv-red rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {passos.map((passo, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] border border-gray-800 flex items-center justify-center text-3xl mb-5 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-sv-red">
                  {passo.emoji}
                </div>
                <span className="text-sv-red text-xs font-black tracking-widest uppercase mb-1">Passo {passo.numero}</span>
                <h3 className="text-white font-black uppercase tracking-tight text-base mb-2 group-hover:text-sv-blue transition-colors duration-200">{passo.titulo}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[200px]">{passo.descricao}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-14">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              className="bg-sv-red text-white font-black px-12 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg">
              Baixar o App Agora
            </a>
          </div>
        </div>
      </div>

      {/* Cupons Exclusivos */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="space-y-3">
            <span className="text-sv-red text-xs font-black tracking-widest uppercase">Só no App</span>
            <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter leading-none">
              Os melhores cupons <br /> você só encontra lá.
            </h2>
          </div>
          <Link href="/cupons"
            className="flex-shrink-0 bg-sv-blue text-white font-black px-8 py-3 rounded-xl uppercase tracking-wider text-xs transition-all duration-200 hover:bg-sv-red hover:scale-105 shadow-md self-start md:self-auto">
            Ver todos os cupons →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { titulo: 'Combo New Castle', desc: 'Burger + Batata + Refri', preco: 'R$ 49,90', original: 'R$ 61,70', emoji: '🔥' },
            { titulo: 'Batata Rústica Grátis', desc: 'Na primeira compra pelo app', preco: 'GRÁTIS', original: 'R$ 12,90', emoji: '🎁' },
            { titulo: 'Milk Shake Duplo', desc: '2 shakes 400ml à escolha', preco: 'R$ 29,90', original: 'R$ 39,80', emoji: '🥛' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col gap-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <span className="text-3xl">{c.emoji}</span>
              <h3 className="font-black text-sv-dark uppercase tracking-tight text-base">{c.titulo}</h3>
              <p className="text-gray-500 text-sm font-medium flex-grow">{c.desc}</p>
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <span className="text-xl font-black text-sv-dark">{c.preco}</span>
                <span className="text-sm font-bold text-gray-400 line-through">{c.original}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="w-full bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter mb-4">Pague como quiser</h2>
          <p className="text-gray-500 font-medium text-base mb-12 max-w-md mx-auto">
            PIX, carteiras digitais, cartão de crédito, débito ou vale-refeição. Rápido e seguro.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { titulo: 'PIX & Carteiras Digitais', emoji: '📱', desc: 'Mercado Pago e outras carteiras digitais aceitas.' },
              { titulo: 'Cartão de Crédito e Débito', emoji: '💳', desc: 'Visa, Mastercard, Elo, Amex e Diners.' },
              { titulo: 'Vale-Refeição', emoji: '🎫', desc: 'Alelo, Ticket e outras bandeiras de VR.' },
            ].map((p, i) => (
              <div key={i} className="bg-[#F7F7F7] rounded-2xl p-6 text-center border border-gray-100">
                <span className="text-4xl block mb-3">{p.emoji}</span>
                <h3 className="font-black text-sv-dark uppercase tracking-tight text-sm mb-2">{p.titulo}</h3>
                <p className="text-gray-500 text-sm font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter">Dúvidas Frequentes</h2>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 px-8 py-2">
          {faqs.map((faq, i) => (
            <FaqItem key={i} item={faq} />
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="w-full bg-sv-red text-white py-20 px-6 text-center relative overflow-hidden rounded-t-[40px] md:rounded-t-[60px] shadow-2xl">
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-white opacity-5 rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-red-200 text-xs font-black uppercase tracking-widest mb-4">Pronto para começar?</p>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
            Baixe agora e ganhe sua <span className="underline decoration-wavy">batata grátis!</span>
          </h3>
          <p className="text-red-100 font-medium text-base mb-10 max-w-sm mx-auto">
            Na primeira compra pelo app, uma Batata Rústica P é por nossa conta.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.apple.com/br/app-store/" target="_blank" rel="noopener noreferrer"
              className="bg-black text-white font-black px-8 py-4 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-lg">
              App Store
            </a>
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              className="bg-white text-sv-red font-black px-8 py-4 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-lg">
              Google Play
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}
