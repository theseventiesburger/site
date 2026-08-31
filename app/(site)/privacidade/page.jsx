'use client';

import { useState, useEffect } from 'react';

const secoes = [
  { id: 'sobre',           titulo: 'Sobre & Introdução'             },
  { id: 'definicoes',      titulo: 'Definições'                     },
  { id: 'dados-coletados', titulo: 'Dados Coletados'                },
  { id: 'finalidades',     titulo: 'Finalidades da Coleta'          },
  { id: 'compartilhamento',titulo: 'Compartilhamento de Dados'      },
  { id: 'seguranca',       titulo: 'Segurança'                      },
  { id: 'retencao',        titulo: 'Retenção de Dados'              },
  { id: 'cookies',         titulo: 'Cookies'                        },
  { id: 'direitos',        titulo: 'Direitos dos Titulares'         },
  { id: 'transferencia',   titulo: 'Transferência Internacional'    },
  { id: 'disposicoes',     titulo: 'Disposições Gerais'             },
];

export default function PrivacidadePage() {
  const [secaoAtiva, setSecaoAtiva] = useState('sobre');

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
            Transparência & Confiança 🔒
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Política de <br />
            <span className="text-sv-red">Privacidade</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-3">Atualizada em 27/11/2025</p>
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
          </div>
        </aside>

        {/* Conteúdo */}
        <article className="flex-1 flex flex-col gap-10 min-w-0">

          {/* Bloco reutilizável */}
          {/* ── Sobre ─────────────────────────────────────────────────────── */}
          <div id="sobre" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Introdução</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Sobre a The Seventies e estas Diretrizes
            </h2>
            <div className="prose-custom">
              <p>A <strong>The Seventies Artesanal Burger</strong> ("The Seventies") é uma hamburgueria artesanal comprometida com valores de qualidade, foco no cliente, ética e autenticidade.</p>
              <p>Acreditamos que a proteção de dados pessoais e a privacidade das pessoas são imprescindíveis para construir um bom relacionamento com nossos consumidores, parceiros e fornecedores. Este documento ("Política de Privacidade") descreve como coletamos, usamos, compartilhamos e protegemos suas informações pessoais.</p>
              <p>Esta Política aplica-se a todo tratamento de dados pessoais conduzido pela The Seventies em território nacional com relação a clientes, parceiros, fornecedores, prestadores de serviço e demais pessoas com quem nos relacionamos ("Titular(es)").</p>
              <p>A leitura deste documento é indispensável para quem deseje interagir com nossos sites, aplicativo e demais plataformas digitais ("Plataformas"). Ao utilizar nossas Plataformas, você declara ter lido e concordado integralmente com os termos aqui previstos.</p>
              <Aviso>Caso não esteja de acordo com estas condições, descontinue imediatamente o acesso às nossas Plataformas.</Aviso>
            </div>
          </div>

          {/* ── Definições ───────────────────────────────────────────────── */}
          <div id="definicoes" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Glossário</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-6">Definições</h2>
            <div className="flex flex-col gap-3">
              {[
                { termo: 'Cookies', def: 'Pequenos arquivos salvos em seu dispositivo que armazenam preferências e informações de navegação para personalizar sua experiência.' },
                { termo: 'Dado Pessoal', def: 'Qualquer informação relacionada a uma pessoa natural identificada ou identificável. Exemplos: nome, CPF, endereço, e-mail.' },
                { termo: 'Dado Pessoal Sensível', def: 'Dados sobre origem racial ou étnica, convicção religiosa, opinião política, saúde, vida sexual, dados genéticos ou biométricos.' },
                { termo: 'DPO / Encarregado', def: 'Data Protection Officer — pessoa responsável por atuar como canal de comunicação entre a empresa, os Titulares e a Autoridade Nacional de Proteção de Dados (ANPD).' },
                { termo: 'IP', def: 'Conjunto de números que identifica um dispositivo conectado à internet.' },
                { termo: 'LGPD', def: 'Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), que regula o tratamento de dados pessoais no Brasil.' },
                { termo: 'Tratamento', def: 'Toda operação realizada com dados pessoais: coleta, armazenamento, uso, compartilhamento, eliminação, entre outras.' },
                { termo: 'Transferência Internacional', def: 'Envio de dados pessoais para outro país ou organismo internacional.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-sv-red mt-1.5" />
                  </div>
                  <div>
                    <span className="font-black text-sv-dark text-sm uppercase tracking-wide">{item.termo}: </span>
                    <span className="text-gray-500 text-sm font-medium leading-relaxed">{item.def}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dados Coletados ──────────────────────────────────────────── */}
          <div id="dados-coletados" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Coleta</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Dados e Informações que Coletamos
            </h2>
            <div className="prose-custom">
              <p>Para que a The Seventies desempenhe suas atividades, coletamos algumas informações sobre o Titular. Os dados podem ser fornecidos diretamente por você, por terceiros ou coletados automaticamente ao usar nossas Plataformas.</p>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { titulo: 'Informações Cadastrais', desc: 'Nome completo, CPF, data de nascimento, endereço, CEP, telefone, e-mail, senha de acesso, token de aplicativo e histórico de pedidos.' },
                { titulo: 'Dados de Navegação', desc: 'Endereço de IP, tipo de navegador, páginas visitadas, data e horário de acesso, cliques em ambientes virtuais (inclusive via cookies) e geolocalização.' },
                { titulo: 'Dados Transacionais', desc: 'Informações de pagamento (cartão de crédito/débito, PIX, carteiras digitais), histórico de compras e preferências de consumo.' },
                { titulo: 'Informações Públicas', desc: 'Dados disponíveis publicamente na internet, como menções ou interações feitas com a marca The Seventies em redes sociais.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-[#F7F7F7] rounded-2xl border border-gray-100 group hover:border-sv-blue transition-colors duration-200">
                  <span className="text-2xl flex-shrink-0">📋</span>
                  <div>
                    <h3 className="font-black text-sv-dark text-sm uppercase tracking-wide mb-1">{item.titulo}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Finalidades ──────────────────────────────────────────────── */}
          <div id="finalidades" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Uso dos Dados</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Para que Usamos seus Dados
            </h2>
            <div className="prose-custom mb-5">
              <p>Os dados coletados pela The Seventies têm como objetivo atender diversas finalidades, a depender do relacionamento do Titular conosco:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { emoji: '🔑', titulo: 'Identificação', desc: 'Verificar credenciais, autenticar logins e garantir segurança no acesso.' },
                { emoji: '🛍️', titulo: 'Vendas e Pedidos', desc: 'Processar pedidos, pagamentos, entrega e retirada de produtos.' },
                { emoji: '📊', titulo: 'Melhoria de Produtos', desc: 'Identificar tendências de uso e aprimorar nossos produtos e serviços.' },
                { emoji: '🎯', titulo: 'Personalização', desc: 'Adaptar conteúdos e ofertas às preferências de cada cliente.' },
                { emoji: '🎉', titulo: 'Promoções', desc: 'Permitir participação em sorteios, concursos e campanhas especiais.' },
                { emoji: '📣', titulo: 'Marketing', desc: 'Enviar novidades, lançamentos e campanhas publicitárias relevantes.' },
                { emoji: '👑', titulo: 'Clube de Pontos', desc: 'Gerenciar o programa de fidelidade e recompensas dos clientes.' },
                { emoji: '⚖️', titulo: 'Obrigações Legais', desc: 'Cumprir exigências legais, fiscais e regulatórias aplicáveis.' },
                { emoji: '🛡️', titulo: 'Prevenção de Fraudes', desc: 'Verificar e mitigar fraudes em pagamentos e transações.' },
                { emoji: '📞', titulo: 'Atendimento ao Cliente', desc: 'Atender solicitações e demandas enviadas ao nosso SAC.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100 hover:border-sv-blue transition-colors duration-200">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-black text-sv-dark text-xs uppercase tracking-wide mb-0.5">{item.titulo}</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Compartilhamento ─────────────────────────────────────────── */}
          <div id="compartilhamento" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Terceiros</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Compartilhamento de Dados com Terceiros
            </h2>
            <div className="prose-custom mb-5">
              <p>A The Seventies compartilha dados pessoais apenas quando estritamente necessário e sempre com parceiros comprometidos com boas práticas de privacidade e segurança. Os principais casos são:</p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { emoji: '🤝', titulo: 'Parceiros Comerciais', desc: 'Plataformas de delivery, agências de publicidade e empresas de armazenamento e administração de dados que suportam nossas operações.' },
                { emoji: '💼', titulo: 'Consultores e Assessores', desc: 'Advogados, contadores, auditores e outros profissionais envolvidos em consultoria jurídica, contábil ou financeira.' },
                { emoji: '🏛️', titulo: 'Autoridades Competentes', desc: 'Quando exigido por lei ou ordem judicial, podemos compartilhar dados com autoridades públicas.' },
                { emoji: '🔒', titulo: 'Segurança e Proteção', desc: 'Em situações de prevenção de fraudes, ilícitos ou riscos à segurança de clientes e colaboradores.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-[#F7F7F7] rounded-2xl border border-gray-100">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-black text-sv-dark text-sm uppercase tracking-wide mb-1">{item.titulo}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Segurança ────────────────────────────────────────────────── */}
          <div id="seguranca" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Proteção</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Padrões de Segurança no Tratamento de Dados
            </h2>
            <div className="prose-custom mb-5">
              <p>Com o objetivo de preservar sua privacidade, adotamos as seguintes medidas de proteção:</p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                'Armazenamento de dados apenas em ambientes de acesso restrito e controlado.',
                'Treinamento e conscientização de toda equipe que acessa dados pessoais.',
                'Adoção de ferramentas e práticas de segurança contra ataques e vazamentos.',
                'Medidas técnicas, administrativas e organizacionais de governança de dados.',
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sv-dark flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Retenção ─────────────────────────────────────────────────── */}
          <div id="retencao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Armazenamento</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Por Quanto Tempo Retemos seus Dados
            </h2>
            <div className="prose-custom">
              <p>Em regra, os dados pessoais ficam armazenados por tempo indeterminado enquanto o Titular mantiver relacionamento com a The Seventies. Caso não deseje mais que seus dados sejam mantidos, você pode solicitar a eliminação por meio das nossas Plataformas ou pelo contato indicado ao final deste documento.</p>
              <p>O armazenamento por tempo determinado ocorre quando: (i) a coleta tiver objetivo específico e pontual; e (ii) houver indicação expressa ao Titular no momento da coleta. Nesses casos, os dados serão mantidos apenas pelo tempo mínimo necessário para atingir a finalidade.</p>
            </div>
          </div>

          {/* ── Cookies ──────────────────────────────────────────────────── */}
          <div id="cookies" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Rastreamento</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Cookies e Tecnologias Similares
            </h2>
            <div className="prose-custom">
              <p>Ao visitar nossas Plataformas, podemos coletar cookies. Utilizamos cookies para reconhecer visitantes, contabilizar acessos únicos e entender quais páginas são mais visitadas. Essas informações podem ser associadas a dados pessoais fornecidos por você.</p>
              <p>Você pode recusar os cookies nas configurações do seu navegador, mas isso pode restringir funcionalidades das nossas Plataformas. A maioria dos navegadores possui a opção "Ajuda" na barra de ferramentas com instruções sobre como gerenciar cookies.</p>
              <p>Também podemos utilizar pixels de rastreamento (arquivos GIF) para gerenciar publicidade em sites de terceiros, identificando quais anúncios direcionam usuários para nossas Plataformas.</p>
            </div>
          </div>

          {/* ── Direitos ─────────────────────────────────────────────────── */}
          <div id="direitos" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Seus Direitos</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Direitos dos Titulares (LGPD)
            </h2>
            <div className="prose-custom mb-5">
              <p>Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui os seguintes direitos sobre seus dados pessoais:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                'Confirmar a existência de tratamento dos seus dados',
                'Acessar os dados pessoais que compartilhou conosco',
                'Solicitar correção de dados incompletos, inexatos ou desatualizados',
                'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários',
                'Solicitar a portabilidade dos dados para outro fornecedor',
                'Requerer a eliminação dos dados tratados com base no consentimento',
                'Obter informações sobre com quem compartilhamos seus dados',
                'Revogar o consentimento a qualquer momento',
                'Solicitar revisão de decisões automatizadas',
              ].map((direito, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-[#F7F7F7] rounded-xl border border-gray-100">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sv-blue flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">{direito}</p>
                </div>
              ))}
            </div>
            <Aviso>Para exercer seus direitos, entre em contato conosco pelo e-mail <strong>privacidade@theseventies.com.br</strong> ou pelo formulário disponível em nossas Plataformas. Sua solicitação pode ser rejeitada por motivos formais ou legais, e nesse caso apresentaremos todas as justificativas cabíveis.</Aviso>
          </div>

          {/* ── Transferência Internacional ──────────────────────────────── */}
          <div id="transferencia" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Internacional</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Transferência Internacional de Dados
            </h2>
            <div className="prose-custom">
              <p>Os dados pessoais coletados podem ser tratados pela The Seventies e/ou por subcontratados, sempre nos moldes da legislação aplicável. Embora estejamos sediados no Brasil, alguns de nossos parceiros ou ferramentas de tecnologia podem estar localizados ou realizar o tratamento de dados em outros países.</p>
              <p>Nesses casos, adotamos medidas adequadas para garantir que tais terceiros estejam sujeitos às mesmas obrigações desta Política de Privacidade e que a transferência internacional seja realizada conforme os termos da Resolução CD/ANPD nº 19, de 23 de agosto de 2024.</p>
            </div>
          </div>

          {/* ── Disposições Gerais ───────────────────────────────────────── */}
          <div id="disposicoes" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Geral</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Disposições Gerais
            </h2>
            <div className="prose-custom">
              <p>A The Seventies reserva o direito de alterar esta Política de Privacidade a qualquer momento. Recomendamos que você a consulte periodicamente para confirmar sua concordância com os termos vigentes, que é condição para o uso de nossas Plataformas.</p>
              <p>Em caso de dúvidas, esclarecimentos ou comunicações institucionais — incluindo contatos de autoridades competentes como a ANPD — entre em contato com nosso DPO pelo e-mail: <strong>privacidade@theseventies.com.br</strong>.</p>
            </div>

            {/* Contato em destaque */}
            <div className="mt-6 p-6 bg-sv-dark rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Encarregado (DPO)</p>
                <p className="font-black text-white text-base uppercase tracking-tight">The Seventies Artesanal Burger</p>
                <p className="text-gray-400 text-sm font-medium">privacidade@theseventies.com.br</p>
              </div>
              <a
                href="mailto:privacidade@theseventies.com.br"
                className="flex-shrink-0 bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Entrar em Contato
              </a>
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

function Aviso({ children }) {
  return (
    <div className="mt-4 p-4 bg-sv-red/5 border-l-4 border-sv-red rounded-r-xl">
      <p className="text-gray-600 text-sm font-medium leading-relaxed">{children}</p>
    </div>
  );
}
