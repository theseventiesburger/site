'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const secoes = [
  { id: 'introducao',     titulo: 'Introdução'                    },
  { id: 'leis',           titulo: 'Leis e Regulamentos'           },
  { id: 'garantias',      titulo: 'Sem Garantias'                 },
  { id: 'responsabilidade', titulo: 'Restrição de Responsabilidade' },
  { id: 'uso-pessoal',    titulo: 'Limite de Uso Pessoal'         },
  { id: 'envio',          titulo: 'Envio de Informação'           },
  { id: 'hyperlinking',   titulo: 'Hyperlinking'                  },
  { id: 'marcas',         titulo: 'Marcas e Direitos Autorais'    },
  { id: 'indenizacao',    titulo: 'Indenização'                   },
  { id: 'jurisdicao',     titulo: 'Jurisdição'                    },
  { id: 'divisibilidade', titulo: 'Divisibilidade'                },
  { id: 'limite',         titulo: 'Limite de Responsabilidade'    },
];

export default function InformacoesLegaisPage() {
  const [secaoAtiva, setSecaoAtiva] = useState('introducao');

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
            Termos de Uso ⚖️
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Informações <br />
            <span className="text-sv-red">Legais</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-3">
            Acordo de Usuário — theseventies.com.br
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

            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/privacidade"
                className="flex items-center justify-center gap-2 bg-sv-dark text-white font-black px-4 py-3 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-red transition-all duration-200 shadow-md">
                🔒 Política de Privacidade
              </Link>
              <Link href="/regulamento-clube"
                className="flex items-center justify-center gap-2 bg-[#F7F7F7] text-sv-dark border border-gray-200 font-black px-4 py-3 rounded-xl uppercase tracking-wider text-xs hover:border-sv-red hover:text-sv-red transition-all duration-200">
                👑 Regulamento do Clube
              </Link>
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <article className="flex-1 flex flex-col gap-8 min-w-0">

          {/* Introdução */}
          <div id="introducao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Acordo de Usuário</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Introdução
            </h2>
            <div className="prose-custom">
              <p className="text-gray-600 text-sm font-medium leading-relaxed">
                Este acordo de usuário ("Acordo") aplica-se a todos os indivíduos ("Usuário" ou "Usuários") que acessam ou navegam em <strong>theseventies.com.br</strong> ou qualquer outro site de propriedade da <strong>THE SEVENTIES ARTESANAL BURGER LTDA.</strong> (coletivamente os "Websites").
              </p>
              <p className="text-gray-600 text-sm font-medium leading-relaxed mt-3">
                O Website é operado por ou em nome da THE SEVENTIES ARTESANAL BURGER LTDA., com sede em <strong>[endereço completo]</strong>, inscrita no CNPJ sob o nº <strong>[XX.XXX.XXX/0001-XX]</strong>. O acesso e uso do Website estão condicionados à sua aceitação integral e sem modificação deste Acordo. Ao usar o Website, você declara ter lido e concordado com todos os termos aqui previstos, incluindo nossa Política de Privacidade incorporada por referência.
              </p>
            </div>
            <Aviso>Caso não esteja de acordo com estas condições, descontinue imediatamente o acesso ao Website.</Aviso>
          </div>

          {/* Leis e Regulamentos */}
          <div id="leis" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Conformidade</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Leis e Regulamentos
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-5">
              O acesso e uso deste Website estão sujeitos a todas as leis e regulamentos internacionais, federais e locais aplicáveis. Ao acessar o Website, os Usuários concordam em não utilizá-lo para propósitos ilegais ou proibidos por este Acordo. Em especial, os Usuários não podem:
            </p>
            <div className="flex flex-col gap-3">
              {[
                { emoji: '⚠️', titulo: 'Danos ao Website', desc: 'Usar o site de forma que possa danificar, desativar, sobrecarregar ou prejudicar seu funcionamento.' },
                { emoji: '🦠', titulo: 'Malware e Vírus', desc: 'Transmitir qualquer material que contenha vírus, código malicioso ou programas projetados para destruir ou limitar funcionalidades de hardware ou software.' },
                { emoji: '©️', titulo: 'Violação de Direitos', desc: 'Transmitir material contendo marcas registradas ou direitos autorais de terceiros sem o devido consentimento por escrito.' },
                { emoji: '🚫', titulo: 'Conteúdo Impróprio', desc: 'Publicar ou transmitir material degradante, difamatório, obsceno, violento, discriminatório ou de mau gosto.' },
                { emoji: '🔌', titulo: 'Interferência', desc: 'Interferir com os servidores ou redes conectados ao Website, ou violar políticas e regulamentos dessas redes.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-black text-sv-dark text-sm uppercase tracking-wide mb-1">{item.titulo}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mt-5">
              Qualquer tentativa de comprometer a operação legítima deste Website poderá constituir violação civil e criminal, e a THE SEVENTIES reserva-se o direito de processar o infrator pelos danos causados, no maior âmbito permitido pela lei.
            </p>
          </div>

          {/* Sem Garantias */}
          <div id="garantias" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Disclaimer</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Sem Garantias
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              A THE SEVENTIES emprega esforços razoáveis para manter as informações do Website precisas e atualizadas; entretanto, não fornece garantias ou representações quanto à exatidão dessas informações. A THE SEVENTIES não assume responsabilidade por erros ou omissões no conteúdo do Website, por falhas, atrasos ou interrupções na entrega de qualquer conteúdo, nem por perdas ou danos decorrentes do uso das informações disponibilizadas.
            </p>
          </div>

          {/* Restrição de Responsabilidade */}
          <div id="responsabilidade" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Responsabilidade</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Restrição de Responsabilidade
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              A THE SEVENTIES não se responsabiliza por danos ou vírus que possam infectar o dispositivo ou propriedade do Usuário em decorrência do acesso, pesquisa ou uso do Website, ou do download de quaisquer materiais, dados, textos, imagens, vídeos ou áudios disponibilizados.
            </p>
          </div>

          {/* Uso Pessoal */}
          <div id="uso-pessoal" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Uso Permitido</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Limite de Uso Pessoal e Não Comercial
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-5">
              Salvo indicação contrária, os serviços oferecidos no Website destinam-se a uso pessoal e não comercial. Os Usuários não estão autorizados a:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Modificar', 'Copiar', 'Distribuir', 'Reproduzir', 'Publicar', 'Licenciar', 'Vender', 'Transmitir', 'Criar obras derivadas'].map((acao, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-[#F7F7F7] rounded-xl border border-gray-100">
                  <span className="w-4 h-4 rounded-full bg-sv-red flex-shrink-0 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                  </span>
                  <span className="text-sv-dark font-black text-xs uppercase tracking-wide">{acao}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs font-medium leading-relaxed mt-4">
              Qualquer informação obtida do Website sem autorização expressa.
            </p>
          </div>

          {/* Envio de Informação */}
          <div id="envio" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Submissões</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Envio de Informação
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              A THE SEVENTIES tem a liberdade de usar comentários, ideias, sugestões, conceitos, fotografias, ilustrações ou quaisquer outros materiais ("Sugestão") enviados pelo Usuário por meio do Website ou por e-mail. Esses envios não serão tratados como confidenciais ou patenteados, e a THE SEVENTIES poderá utilizá-los para qualquer finalidade — incluindo o desenvolvimento de produtos e a melhoria do Website — sem pagamento, reconhecimento ou compensação adicional ao Usuário.
            </p>
          </div>

          {/* Hyperlinking */}
          <div id="hyperlinking" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Links Externos</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Hyperlinking
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Este Website pode conter links para sites de terceiros. A THE SEVENTIES não revisa todos os sites que possam estar vinculados e não se responsabiliza pelo conteúdo, políticas de privacidade ou práticas de páginas externas. A navegação em sites de terceiros é de inteira responsabilidade e risco do Usuário.
            </p>
          </div>

          {/* Marcas Registradas */}
          <div id="marcas" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Propriedade Intelectual</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Marcas Registradas e Direitos Autorais
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-4">
              Todas as marcas, logotipos e marcas de serviço exibidos no Website são de propriedade da THE SEVENTIES ARTESANAL BURGER ou de terceiros que autorizaram seu uso. Os Usuários não podem utilizar, copiar, reproduzir, distribuir ou modificar essas marcas de nenhuma forma.
            </p>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Todos os materiais contidos no Website têm seus direitos reservados, salvo indicação expressa em contrário. A THE SEVENTIES fará cumprir severamente seus direitos de propriedade intelectual no âmbito total da lei. O uso de quaisquer materiais do Website é de responsabilidade e risco do próprio Usuário.
            </p>
          </div>

          {/* Indenização */}
          <div id="indenizacao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Responsabilidade do Usuário</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Indenização
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Ao usar este Website, o Usuário aceita total responsabilidade por suas ações e concorda em isentar e defender a THE SEVENTIES, suas empresas relacionadas e respectivos funcionários, diretores, empregados e sucessores de quaisquer reclamações decorrentes de suas ações no Website — incluindo Sugestões ou outros materiais por ele enviados.
            </p>
          </div>

          {/* Jurisdição */}
          <div id="jurisdicao" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Foro e Leis</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Jurisdição e Leis Aplicáveis
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Todas as divergências relativas à construção, validade, interpretação e execução deste Acordo, ou aos direitos e obrigações dos Usuários e da THE SEVENTIES em relação ao Website, serão regidas e interpretadas de acordo com as <strong>leis vigentes no Brasil</strong>, afastando-se qualquer outra jurisdição.
            </p>
          </div>

          {/* Divisibilidade */}
          <div id="divisibilidade" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Cláusulas</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Divisibilidade das Disposições
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Se qualquer cláusula deste Acordo for declarada inválida ou inexigível pelo juízo da jurisdição competente, tal cláusula será separada do restante do Acordo, que continuará válido e em pleno vigor e efeito.
            </p>
          </div>

          {/* Limite de Responsabilidade */}
          <div id="limite" className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 scroll-mt-28">
            <Tag>Limitação</Tag>
            <h2 className="text-2xl font-black text-sv-dark uppercase tracking-tighter mt-2 mb-4">
              Limite de Responsabilidade
            </h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-4">
              A THE SEVENTIES, suas empresas relacionadas e respectivos funcionários, diretores e sucessores não são responsáveis por quaisquer produtos ou serviços de terceiros eventualmente disponibilizados no Website. No limite máximo permitido em lei, a THE SEVENTIES afasta quaisquer garantias explícitas ou implícitas relativas a produtos e serviços de terceiros, incluindo garantias de adequação a uma finalidade específica.
            </p>

            {/* Links para outros documentos legais */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Documentos relacionados</p>
              <div className="flex flex-col gap-3">
                <Link href="/privacidade"
                  className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100 hover:border-sv-blue transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔒</span>
                    <div>
                      <p className="font-black text-sv-dark text-sm uppercase tracking-wide group-hover:text-sv-blue transition-colors duration-200">Política de Privacidade</p>
                      <p className="text-gray-400 text-xs font-medium">Diretrizes de proteção de dados pessoais</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-sv-blue transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
                <Link href="/regulamento-clube"
                  className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100 hover:border-sv-blue transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👑</span>
                    <div>
                      <p className="font-black text-sv-dark text-sm uppercase tracking-wide group-hover:text-sv-blue transition-colors duration-200">Regulamento do Clube de Vantagens</p>
                      <p className="text-gray-400 text-xs font-medium">Termos do programa de recompensas</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-sv-blue transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
                <a href="/codigo-etica-fornecedores.pdf" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100 hover:border-sv-blue transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="font-black text-sv-dark text-sm uppercase tracking-wide group-hover:text-sv-blue transition-colors duration-200">Código de Ética e Conduta para Fornecedores</p>
                      <p className="text-gray-400 text-xs font-medium">Incluindo Política de Privacidade para Fornecedores</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-sv-blue transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              </div>
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
