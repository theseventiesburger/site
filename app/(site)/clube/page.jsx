'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Dados ────────────────────────────────────────────────────────────────────
const vantagens = [
  {
    emoji: '🪙',
    titulo: 'R$1 = 1 Ponto',
    descricao: 'Comprou, pontuou! A cada R$1 gasto em produtos você ganha 1 ponto no Clube.',
  },
  {
    emoji: '🍔',
    titulo: 'Troque por Recompensas',
    descricao: 'Acumule pontos e troque por hambúrgueres, batatas e muito mais pelo app.',
  },
  {
    emoji: '⚡',
    titulo: 'Pontos Extras em Campanhas',
    descricao: 'Fique de olho nas campanhas especiais e ganhe pontos em dobro em ações exclusivas.',
  },
  {
    emoji: '🎂',
    titulo: 'Mimo de Aniversário',
    descricao: 'No mês do seu aniversário, seus pontos valem o dobro. Porque você merece!',
  },
];

const passos = [
  {
    numero: '01',
    pergunta: 'Como entro no clube?',
    resposta: 'Baixe o nosso App, aceite os termos e você já estará participando do Clube de Vantagens automaticamente.',
    emoji: '📲',
  },
  {
    numero: '02',
    pergunta: 'Como ganho pontos?',
    resposta: 'Nas compras no restaurante, informe seu CPF. Pelo app, a pontuação é automática. A cada R$1 gasto, 1 ponto.',
    emoji: '🪙',
  },
  {
    numero: '03',
    pergunta: 'Como resgato recompensas?',
    resposta: 'Escolha a recompensa pelo App e troque pelos seus pontos. Após resgatar, retire em até 15 dias.',
    emoji: '🎁',
  },
  {
    numero: '04',
    pergunta: 'Como faço para retirar?',
    resposta: 'Informe o código da sua recompensa em um restaurante participante e retire seu pedido. Simples assim!',
    emoji: '🏃',
  },
];

const recompensas = [
  { titulo: 'Batata Rústica P', pontos: '300 pts', emoji: '🍟', destaque: false },
  { titulo: 'Refrigerante 400ml', pontos: '250 pts', emoji: '🥤', destaque: false },
  { titulo: 'New Castle', pontos: '800 pts', emoji: '🍔', destaque: true },
  { titulo: 'Milk Shake 400ml', pontos: '500 pts', emoji: '🥛', destaque: false },
  { titulo: 'Combo Completo', pontos: '1.200 pts', emoji: '🎉', destaque: false },
  { titulo: 'Brownie + Sorvete', pontos: '400 pts', emoji: '🍫', destaque: false },
];

const faqs = [
  {
    pergunta: 'O que é o Clube de Vantagens?',
    resposta: 'É o nosso programa de benefícios gratuito onde você ganha pontos em cada compra e troca por recompensas e produtos. Basta ter um cadastro no nosso App para aproveitar!',
  },
  {
    pergunta: 'Como funciona o programa?',
    resposta: 'A cada R$1 gasto em produtos, você ganha 1 ponto. Você pode pontuar comprando pelo app (automático) ou no restaurante informando seu CPF. Consulte e resgate suas recompensas pelo app.',
  },
  {
    pergunta: 'Como eu participo?',
    resposta: 'A participação é gratuita! Basta baixar nosso app, fazer seu cadastro e aceitar o regulamento. Pronto — você já começa a acumular pontos na próxima compra.',
  },
  {
    pergunta: 'Preciso informar o CPF na compra?',
    resposta: 'Sim, nas compras no balcão, totem ou drive-thru. No app, a pontuação já é automática e você não precisa informar nada.',
  },
  {
    pergunta: 'Quantos pontos ganho em cada compra?',
    resposta: 'A cada R$1 gasto em produtos, você ganha 1 ponto. Se o valor tiver centavos, eles são acumulados e somados quando completar um real inteiro.',
  },
  {
    pergunta: 'Qual o prazo de validade dos meus pontos?',
    resposta: 'Os pontos gerados em cada compra expiram depois de 4 (quatro) meses contados a partir da data da compra. Fique de olho para não perder!',
  },
  {
    pergunta: 'Como troco meus pontos por recompensas?',
    resposta: 'Acesse a área "Clube" no app, veja as recompensas disponíveis para sua quantidade de pontos, escolha a que quiser e confirme a troca. Um código será gerado para você retirar no restaurante.',
  },
  {
    pergunta: 'Fiz uma compra, mas não recebi meus pontos. O que faço?',
    resposta: 'O prazo é de até 24h após a compra. Se depois disso os pontos não aparecerem, entre em contato pelo nosso WhatsApp com as informações do pedido e a gente resolve.',
  },
  {
    pergunta: 'Meu pedido foi cancelado — recebo os pontos?',
    resposta: 'Não. Em caso de cancelamento de um pedido, antes ou depois da produção, os pontos não são contabilizados.',
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
        <span className="font-black text-sv-dark uppercase tracking-tight text-sm md:text-base group-hover:text-sv-blue transition-colors duration-200 pr-4">
          {item.pergunta}
        </span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300
          ${aberto ? 'bg-sv-red text-white rotate-45' : 'bg-gray-100 text-sv-dark'}`}>
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
export default function ClubePage() {
  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div className="relative w-full min-h-[520px] md:min-h-[600px] bg-sv-dark overflow-hidden flex items-center">
        <Image src="/hb2.png" alt="Clube de Vantagens" fill className="object-cover opacity-10" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-sv-dark via-sv-dark/90 to-sv-dark/70" />

        {/* Moedas decorativas */}
        <div className="absolute top-16 right-10 text-6xl opacity-20 select-none hidden md:block">🪙</div>
        <div className="absolute bottom-20 right-32 text-4xl opacity-10 select-none hidden md:block">🪙</div>
        <div className="absolute top-32 right-48 text-3xl opacity-15 select-none hidden md:block">🪙</div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full py-24">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-5 block">
            Programa de Fidelidade 👑
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Clube de <br />
            <span className="text-sv-red">Vantagens</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg text-base leading-relaxed mb-10">
            Tem recompensas te esperando! Acumule pontos em cada pedido e troque por produtos incríveis. Grátis, simples e sem complicação.
          </p>

          {/* Contador ilustrativo */}
          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { valor: 'R$1', label: '= 1 Ponto' },
              { valor: '4 meses', label: 'de validade' },
              { valor: '2x', label: 'pontos no aniversário' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center backdrop-blur-sm">
                <span className="block text-2xl font-black text-sv-red">{stat.valor}</span>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              className="bg-sv-red text-white font-black px-10 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg">
              Baixar o App
            </a>
            <Link href="/app-the70s"
              className="bg-white/10 border border-white/20 text-white font-black px-10 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:bg-white/20">
              Saiba mais
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* ── Vantagens ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center mb-14 space-y-4">
          <span className="text-sv-red text-xs font-black tracking-widest uppercase">Por que participar?</span>
          <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter">
            Vantagens e Benefícios
          </h2>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vantagens.map((v, i) => (
            <div key={i}
              className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              <span className="text-5xl mb-5">{v.emoji}</span>
              <h3 className="text-base font-black text-sv-dark uppercase tracking-tight mb-2 group-hover:text-sv-blue transition-colors duration-200">
                {v.titulo}
              </h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">{v.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Como Funciona ─────────────────────────────────────────────────────── */}
      <div className="w-full bg-sv-dark py-24 px-6 relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-sv-red opacity-5 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-14 space-y-4">
            <span className="text-sv-red text-xs font-black tracking-widest uppercase">Passo a passo</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Como Funciona o Clube?
            </h2>
            <div className="w-24 h-1.5 bg-sv-red rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {passos.map((passo, i) => (
              <div key={i} className="group">
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-7 h-full flex flex-col transition-all duration-300 hover:border-sv-red hover:shadow-[0_0_30px_rgba(255,0,0,0.1)]">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl">{passo.emoji}</span>
                    <span className="text-sv-red text-xs font-black tracking-widest uppercase">{passo.numero}</span>
                  </div>
                  <h3 className="text-white font-black uppercase tracking-tight text-base mb-3 group-hover:text-sv-blue transition-colors duration-200">
                    {passo.pergunta}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed flex-grow">{passo.resposta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              className="bg-sv-red text-white font-black px-12 py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 shadow-lg">
              Baixar o App e Participar
            </a>
          </div>
        </div>
      </div>

      {/* ── Recompensas ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="space-y-3">
            <span className="text-sv-red text-xs font-black tracking-widest uppercase">Troque seus pontos</span>
            <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter leading-none">
              Recompensas <br /> Exclusivas
            </h2>
          </div>
          <p className="text-gray-500 text-sm font-medium max-w-xs md:text-right">
            Disponíveis apenas pelo app. Acumule e resgate quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recompensas.map((r, i) => (
            <div key={i}
              className={`rounded-3xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group border
                ${r.destaque
                  ? 'bg-sv-dark border-sv-red shadow-[0_0_20px_rgba(255,0,0,0.15)]'
                  : 'bg-white border-gray-100 shadow-md'
                }`}>
              <span className="text-4xl mb-3">{r.emoji}</span>
              <h3 className={`text-xs font-black uppercase tracking-tight mb-2
                ${r.destaque ? 'text-white' : 'text-sv-dark group-hover:text-sv-blue'} transition-colors duration-200`}>
                {r.titulo}
              </h3>
              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full
                ${r.destaque ? 'bg-sv-red text-white' : 'bg-[#F7F7F7] text-sv-dark'}`}>
                {r.pontos}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Avisos de Prazo ───────────────────────────────────────────────────── */}
      <div className="w-full bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12 space-y-4">
            <span className="text-sv-red text-xs font-black tracking-widest uppercase">Importante</span>
            <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter">
              Fique de Olho!
            </h2>
            <div className="w-24 h-1.5 bg-sv-red rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F7F7F7] rounded-3xl p-8 border border-gray-100">
              <span className="text-4xl block mb-4">⏰</span>
              <h3 className="font-black text-sv-dark uppercase tracking-tight text-base mb-3">Se liga nos prazos</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Seus pontos são válidos por <strong className="text-sv-dark">4 meses</strong>. Se não utilizados dentro do prazo, irão expirar automaticamente da sua conta.
              </p>
            </div>
            <div className="bg-[#F7F7F7] rounded-3xl p-8 border border-gray-100">
              <span className="text-4xl block mb-4">📅</span>
              <h3 className="font-black text-sv-dark uppercase tracking-tight text-base mb-3">Prazo para retirada</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Após resgatar uma recompensa pelo app, você pode retirar em um restaurante participante em até <strong className="text-sv-dark">15 dias</strong>, podendo variar conforme a campanha.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter">
            Dúvidas Frequentes
          </h2>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 px-8 py-2">
          {faqs.map((faq, i) => (
            <FaqItem key={i} item={faq} />
          ))}
        </div>
      </div>

      {/* ── CTA Final ─────────────────────────────────────────────────────────── */}
      <div className="w-full bg-sv-red text-white py-20 px-6 text-center relative overflow-hidden rounded-t-[40px] md:rounded-t-[60px] shadow-2xl">
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-white opacity-5 rounded-full pointer-events-none" />
        <div className="absolute -left-10 top-10 text-8xl opacity-10 select-none">🪙</div>

        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-red-200 text-xs font-black uppercase tracking-widest mb-4">Faça parte do clube</p>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
            Baixe o app e comece <br /> a <span className="underline decoration-wavy">pontuar agora!</span>
          </h3>
          <p className="text-red-100 font-medium text-base mb-10 max-w-sm mx-auto">
            Cadastro gratuito. Na primeira compra pelo app, uma Batata Rústica P é por nossa conta.
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
