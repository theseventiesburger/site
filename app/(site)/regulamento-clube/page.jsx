'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const secoes = [
  { id: 'definicao',    titulo: 'I. Definição'              },
  { id: 'pontuacao',    titulo: 'II. Pontuação'             },
  { id: 'cadastro',     titulo: 'III. Cadastro'             },
  { id: 'resgate',      titulo: 'IV. Resgate'               },
  { id: 'saida',        titulo: 'V. Saída do Programa'      },
  { id: 'suspensao',    titulo: 'VI. Suspensão e Bloqueio'  },
  { id: 'disposicoes',  titulo: 'VII. Disposições Gerais'   },
  { id: 'foro',         titulo: 'VIII. Foro'                },
  { id: 'aceitacao',    titulo: 'IX. Aceitação'             },
];

export default function RegulamentoClubePage() {
  const [secaoAtiva, setSecaoAtiva] = useState('definicao');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSecaoAtiva(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    secoes.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[220px] md:h-[280px] bg-sv-dark overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-sv-dark via-sv-dark/90 to-sv-dark/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-4 block">
            Programa de Fidelidade 👑
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Regulamento do <br />
            <span className="text-sv-red">Clube de Vantagens</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-3">
            Termos e Condições — Programa de Recompensas The Seventies
          </p>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L1440 60 L1440 0 Q720 60 0 0 Z" fill="#F7F7F7" />
          </svg>
        </div>
      </div>

      {/* ── Layout ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 flex flex-col lg:flex-row gap-10 items-start">

        {/* Sumário lateral */}
        <aside className="lg:sticky lg:top-24 w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Sumário</h2>
            <nav className="flex flex-col gap-1">
              {secoes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                    ${secaoAtiva === s.id
                      ? 'bg-sv-dark text-white'
                      : 'text-gray-500 hover:bg-[#F7F7F7] hover:text-sv-dark'
                    }`}
                >
                  {s.titulo}
                </button>
              ))}
            </nav>

            {/* Link para o Clube */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <Link
                href="/clube"
                className="flex items-center justify-center gap-2 bg-sv-red text-white font-black px-4 py-3 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-md"
              >
                👑 Conhecer o Clube
              </Link>
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <article className="flex-1 flex flex-col gap-8 min-w-0">

          {/* Intro */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <Tag>Termos e Condições</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Programa de Recompensas — The Seventies
            </h2>
            <div className="prose-custom">
              <p>
                <strong>THE SEVENTIES ARTESANAL BURGER LTDA.</strong>, com sede em [endereço completo], inscrita no CNPJ sob o nº [XX.XXX.XXX/0001-XX], doravante denominada simplesmente como <strong>"THE SEVENTIES"</strong>, regulamenta o <strong>PROGRAMA DE RECOMPENSAS THE SEVENTIES</strong>, denominado <strong>"CLUBE DE VANTAGENS"</strong>, conforme os termos e condições a seguir.
              </p>
            </div>
          </div>

          {/* I. Definição */}
          <div id="definicao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo I</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Definição</h2>
            <Artigo numero="1.1">
              O <strong>CLUBE DE VANTAGENS</strong> é um programa de recompensas desenvolvido pela THE SEVENTIES e ofertado aos seus consumidores, com vigência por prazo indeterminado, que permite ao usuário obter pontos que poderão ser trocados por cupons de desconto nos produtos da THE SEVENTIES, pelo nosso aplicativo disponível para download na Apple Store e Google Play.
            </Artigo>
          </div>

          {/* II. Pontuação */}
          <div id="pontuacao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo II</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Pontuação</h2>
            <div className="flex flex-col gap-3">
              <Artigo numero="2.1">Não há valor mínimo de compra para pontuar, nem número máximo de pontos por compra.</Artigo>
              <Artigo numero="2.2">
                O usuário ganha <strong>1 (um) ponto a cada R$1,00 (um real)</strong> gasto em compras identificadas com o CPF cadastrado no Clube de Vantagens. Os canais de pontuação são:
                <ul className="mt-3 flex flex-col gap-2">
                  {[
                    'Compras pelo App: o CPF é identificado automaticamente, e a pontuação é creditada após a produção do pedido.',
                    'Compras no restaurante (balcão, totem ou drive-thru): informe o CPF cadastrado no momento do pagamento.',
                    'Compras em aplicativos de delivery de terceiros (iFood, Rappi etc.) não pontuam.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 items-start text-sm text-gray-600 font-medium leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sv-blue flex items-center justify-center mt-0.5">
                        <span className="text-white text-[9px] font-black">{String.fromCharCode(97 + i).toUpperCase()}</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Artigo>
              <Artigo numero="2.3">Pode ser necessário informar o CPF duas vezes caso o cliente queira o CPF na nota fiscal e também queira acumular pontos.</Artigo>
              <Artigo numero="2.4">Os centavos não pontuam e não acumulam para compras futuras.</Artigo>
              <Artigo numero="2.5">O número de pontos não depende do meio de pagamento — o que define é o valor total pago.</Artigo>
              <Artigo numero="2.6">Todo o gerenciamento de pontos e resgate de recompensas é realizado pelo App. O programa é 100% (cem por cento) online.</Artigo>
              <Artigo numero="2.7">Os pontos são creditados em até <strong>24h (vinte e quatro horas)</strong> após a compra. Em caso de problemas, acione o SAC pelo menu "Ajuda" do App.</Artigo>
              <Artigo numero="2.8">O usuário deve guardar o comprovante fiscal para comprovar compras que eventualmente não sejam computadas.</Artigo>
              <Artigo numero="2.9">Os pontos são <strong>pessoais e intransferíveis</strong>.</Artigo>
              <Artigo numero="2.10">
                Os pontos gerados expiram após <strong>4 (quatro) meses</strong> contados da data da compra que os gerou, salvo em campanhas promocionais com prazo específico informado no App.
              </Artigo>
              <Artigo numero="2.11">Nem todos os restaurantes são participantes. Consulte a lista atualizada no App — ela pode ser alterada sem aviso prévio.</Artigo>
              <Artigo numero="2.12">A THE SEVENTIES poderá realizar campanhas por tempo limitado com pontos extras, além de distribuir pontos via códigos obtidos em ações pontuais, newsletters e materiais em loja.</Artigo>
            </div>

            {/* Destaque */}
            <div className="mt-6 p-5 bg-sv-dark rounded-2xl flex items-center gap-4">
              <span className="text-3xl">🪙</span>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wide">Regra de Ouro</p>
                <p className="text-gray-400 text-sm font-medium">R$1,00 gasto = 1 ponto. Sem valor mínimo de compra.</p>
              </div>
            </div>
          </div>

          {/* III. Cadastro */}
          <div id="cadastro" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo III</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Cadastro</h2>
            <div className="flex flex-col gap-3">
              <Artigo numero="3.1">
                O cliente precisa ter uma conta no App da THE SEVENTIES para participar do Clube de Vantagens. Ao criar a conta e aceitar o regulamento e os termos de privacidade, o cliente é automaticamente inscrito no programa.
              </Artigo>
              <Artigo numero="3.2">O cadastro não pode ser realizado por meio de outras plataformas.</Artigo>
              <Artigo numero="3.3">
                Para criar uma conta no App são exigidos: <strong>nome completo, e-mail e CPF</strong>, além do aceite dos termos de uso e da política de privacidade.
              </Artigo>
              <Artigo numero="3.4">Só pode haver <strong>1 (um) CPF por cadastro</strong> no Clube de Vantagens.</Artigo>
              <Artigo numero="3.5">O programa é direcionado exclusivamente a <strong>pessoas físicas</strong>.</Artigo>
              <Artigo numero="3.6">Para se cadastrar, o usuário deve possuir ao menos <strong>12 (doze) anos de idade</strong>.</Artigo>
            </div>

            {/* Cards de requisitos */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { emoji: '👤', titulo: 'Nome Completo', desc: 'Seu nome como consta no documento.' },
                { emoji: '✉️', titulo: 'E-mail', desc: 'Para receber notificações e cupons.' },
                { emoji: '🪪', titulo: 'CPF', desc: 'Único por cadastro. Usado para pontuar.' },
              ].map((item, i) => (
                <div key={i} className="bg-[#F7F7F7] rounded-2xl p-5 text-center border border-gray-100">
                  <span className="text-3xl block mb-2">{item.emoji}</span>
                  <h3 className="font-black text-sv-dark text-xs uppercase tracking-wide mb-1">{item.titulo}</h3>
                  <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* IV. Resgate */}
          <div id="resgate" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo IV</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Resgate</h2>
            <div className="flex flex-col gap-3">
              <Artigo numero="4.1">O usuário pode trocar seus pontos pelas recompensas disponíveis no programa.</Artigo>
              <Artigo numero="4.2">Não há um valor fixo em reais por ponto. A THE SEVENTIES atribui recompensas variadas aos pontos acumulados, a seu critério.</Artigo>
              <Artigo numero="4.3">O resgate no App gera um <strong>código único</strong> que deve ser apresentado no restaurante participante para retirada do produto.</Artigo>
              <Artigo numero="4.4">O resgate e geração de código de recompensa são realizados <strong>exclusivamente pelo App</strong>.</Artigo>
              <Artigo numero="4.5">A retirada da recompensa é realizada <strong>somente em restaurantes participantes</strong> do Clube de Vantagens.</Artigo>
              <Artigo numero="4.6">
                No momento da retirada, o restaurante poderá solicitar:
                <ul className="mt-3 flex flex-col gap-2">
                  {[
                    'O código de resgate exibido diretamente na tela do App.',
                    'O extrato do Clube de Vantagens no App como comprovante de pontos.',
                    'Que o cliente informe o CPF cadastrado no programa.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 items-start text-sm text-gray-600 font-medium leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sv-dark flex items-center justify-center mt-0.5">
                        <span className="text-white text-[9px] font-black">{String.fromCharCode(97 + i).toUpperCase()}</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Artigo>
              <Artigo numero="4.7">
                Cada recompensa tem um prazo de retirada informado no App. Caso o usuário não retire dentro do prazo, <strong>os pontos não serão ressarcidos</strong>.
              </Artigo>
              <Artigo numero="4.8">Em caso de problemas na retirada, o usuário deve acionar o SAC pelo menu "Ajuda" do App.</Artigo>
              <Artigo numero="4.9">A THE SEVENTIES reserva o direito de alterar, incluir ou retirar recompensas a qualquer momento.</Artigo>
              <Artigo numero="4.10">Os produtos listados como recompensa têm caráter indicativo e estão sujeitos à disponibilidade em estoque.</Artigo>
              <Artigo numero="4.11">Usuários com a mesma pontuação podem receber recompensas diferentes, conforme personalização baseada no histórico de compras.</Artigo>
              <Artigo numero="4.12">O programa pode incluir ofertas não vinculadas a pontos, criadas pela THE SEVENTIES e anunciadas no App.</Artigo>
            </div>

            <Aviso>Fique sempre de olho no prazo de expiração dos seus pontos e recompensas para não perdê-los!</Aviso>
          </div>

          {/* V. Saída */}
          <div id="saida" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo V</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Saída do Programa</h2>
            <div className="flex flex-col gap-3">
              <Artigo numero="5.1">
                O cadastro no App e no Clube de Vantagens é <strong>unificado</strong>. O usuário que excluir a conta do App também perderá a conta do programa e <strong>todos os pontos e recompensas acumulados</strong>.
              </Artigo>
              <Artigo numero="5.2">
                A decisão de exclusão do App é unilateral e faz com que todos os pontos acumulados até o momento sejam <strong>permanentemente perdidos</strong>.
              </Artigo>
            </div>
            <Aviso>Antes de excluir sua conta, resgate todas as recompensas disponíveis para não perder seus pontos.</Aviso>
          </div>

          {/* VI. Suspensão */}
          <div id="suspensao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo VI</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Suspensão e Bloqueio do Usuário</h2>
            <div className="flex flex-col gap-3">
              <Artigo numero="6.1">
                Em caso de suspeita ou tentativa de fraude, o cadastro poderá ser <strong>suspenso</strong>, impossibilitando o acúmulo de pontos e o resgate de recompensas.
              </Artigo>
              <Artigo numero="6.2">
                A suspensão é <strong>reversível</strong>. O cliente deve justificar sua conduta junto ao SAC. Comprovadas as razões, a conta será liberada.
              </Artigo>
              <Artigo numero="6.3">
                Comprovado o ato fraudulento ou o descumprimento deste regulamento, o usuário poderá ter sua conta <strong>bloqueada definitivamente</strong>.
              </Artigo>
            </div>
          </div>

          {/* VII. Disposições Gerais */}
          <div id="disposicoes" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo VII</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Disposições Gerais</h2>
            <div className="flex flex-col gap-3">
              <Artigo numero="7.1">
                A THE SEVENTIES reserva o direito de alterar condições e termos de uso ou encerrar o programa de recompensas a qualquer momento e a seu exclusivo critério.
              </Artigo>
              <Artigo numero="7.2">
                Em caso de encerramento do Clube de Vantagens, garante-se ao usuário a possibilidade de utilização dos pontos anteriormente acumulados, respeitando o prazo de expiração de <strong>6 (seis) meses</strong> a partir da data do respectivo acúmulo.
              </Artigo>
            </div>
          </div>

          {/* VIII. Foro */}
          <div id="foro" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo VIII</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Foro</h2>
            <Artigo numero="8.1">
              Para dirimir controvérsias oriundas deste regulamento, fica eleito o foro da Comarca de <strong>[sua cidade]</strong>, no Estado de <strong>[seu estado]</strong>, com renúncia a qualquer outro, por mais privilegiado que seja.
            </Artigo>
          </div>

          {/* IX. Aceitação */}
          <div id="aceitacao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Capítulo IX</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-5">Aceitação dos Termos e Condições</h2>
            <Artigo numero="9.1">
              O Usuário declara ter lido, compreendido e que aceita todas as regras e condições estabelecidas neste documento.
            </Artigo>

            {/* Assinatura */}
            <div className="mt-6 p-6 bg-sv-dark rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Emitido por</p>
                <p className="font-black text-white text-base uppercase tracking-tight">The Seventies Artesanal Burger</p>
                <p className="text-gray-400 text-sm font-medium mt-1">[Cidade], [data de emissão].</p>
              </div>
              <Link
                href="/clube"
                className="flex-shrink-0 bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-lg"
              >
                👑 Ir para o Clube
              </Link>
            </div>
          </div>

        </article>
      </div>
    </section>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function Tag({ children }) {
  return (
    <span className="inline-block bg-[#F7F7F7] text-sv-dark text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-200">
      {children}
    </span>
  );
}

function Artigo({ numero, children }) {
  return (
    <div className="flex gap-4 p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100">
      <span className="flex-shrink-0 text-[10px] font-black text-sv-red uppercase tracking-widest mt-0.5 min-w-[28px]">
        {numero}
      </span>
      <p className="text-gray-600 text-sm font-medium leading-relaxed">{children}</p>
    </div>
  );
}

function Aviso({ children }) {
  return (
    <div className="mt-5 p-4 bg-sv-red/5 border-l-4 border-sv-red rounded-r-xl">
      <p className="text-gray-600 text-sm font-medium leading-relaxed">{children}</p>
    </div>
  );
}
