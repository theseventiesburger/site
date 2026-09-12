import HeroSlider from '@/components/HeroSlider';
import CardCampeao from '@/components/CardCampeao';
import GoogleRatingBadge from '@/components/GoogleRatingBadge';
import Image from 'next/image';
import { criarClienteServidor } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await criarClienteServidor();
  const [{ data: produtosPromocao }, { data: maisVendidos }] = await Promise.all([
    supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .not('preco_promocional', 'is', null)
      .order('ordem', { ascending: true }),
    supabase.rpc('produtos_mais_vendidos', { p_limite: 3 }),
  ]);

  // "Campeões de Vendas" e os slides de destaque do banner vêm dos produtos
  // realmente mais vendidos (RPC produtos_mais_vendidos, soma itens_pedido
  // de pedidos não cancelados) — nada de lista fixa desatualizada.
  const campeoes = maisVendidos ?? [];

  const depoimentos = [
    {
      texto: "Ambiente muito gostoso, excelentíssimo atendimento e sabor dos deuses. Com opção de montar o seu lanche, como quiser, além de opções excelentes da casa. Sabores variados e qualidade incrível. É de comer de olhos fechados, super indico.",
      nome: "Amanda Pires",
      selo: "Local Guide no Google",
    },
    {
      texto: "Boa comida, atendimento exemplar, boa música e ambiente acolhedor, além do Chopp Brahma bem gelado. Foi uma grata surpresa ter conhecido a hamburgueria The Seventies!",
      nome: "Felipe Otero",
      selo: "Avaliação no Google",
    },
    {
      texto: "Lugar muito bom, os lanches são muito bons, o chopp é gelado, fora as opções de drinks e sucos. O atendimento nem se fala, os donos são super atenciosos, atendem bem.",
      nome: "Daltro Imbasciati",
      selo: "Local Guide no Google",
    },
    {
      texto: "Ótima localização, bem no centro de São Lourenço. 18 opções para escolha.",
      nome: "Avaliação no Google",
      selo: null,
    },
    {
      texto: "A porção de frango frito é bem servida e os molhos são todos feitos na casa.",
      nome: "Avaliação no Google",
      selo: null,
    },
  ];

  return (
    <section className="w-full bg-[#F7F7F7]">
      <HeroSlider produtosPromocao={produtosPromocao ?? []} produtosDestaque={campeoes.slice(0, 2)} />

      <div className="w-full flex justify-center -mt-7 relative z-10">
        <GoogleRatingBadge />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">

        <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
          <h3 className="text-4xl md:text-5xl font-black text-sv-dark tracking-tighter uppercase">
            Nossos Campeões de Vendas
          </h3>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>

        {campeoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {campeoes.map((item, indice) => (
              <CardCampeao key={item.produto_id} item={item} indice={indice} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm font-medium mb-16">
            Ainda sem vendas registradas pra calcular os campeões — assim que os primeiros pedidos
            entrarem, essa seção se preenche sozinha.
          </p>
        )}

        <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
          <h3 className="text-4xl md:text-5xl font-black text-sv-dark tracking-tighter uppercase">
            O que dizem sobre a gente
          </h3>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
          <GoogleRatingBadge className="mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {depoimentos.map((depoimento, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col gap-4"
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 1.5l2.59 5.25 5.8.84-4.2 4.09.99 5.77L10 14.7l-5.18 2.75.99-5.77-4.2-4.09 5.8-.84L10 1.5z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm font-medium leading-relaxed flex-grow">
                &ldquo;{depoimento.texto}&rdquo;
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-black text-sv-dark text-sm">{depoimento.nome}</p>
                {depoimento.selo && (
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{depoimento.selo}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-16">
          <a
            href="https://www.google.com/maps/search/?api=1&query=The+Seventies+Artesanal+Burger+R.+Wenceslau+Braz+167+S%C3%A3o+Louren%C3%A7o+MG"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sv-blue hover:text-sv-red font-black uppercase tracking-wider text-xs transition-colors duration-150"
          >
            Ver todas as avaliações no Google →
          </a>
        </div>

      </div>


      <div className="w-full bg-sv-red text-white py-20 lg:py-28 overflow-hidden relative rounded-t-[40px] md:rounded-t-[60px] shadow-2xl">

        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-white opacity-5 rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div className="w-full flex justify-center order-2 md:order-1 relative group">

            <div className="w-[280px] h-[560px] bg-[#1A1A1A] rounded-[40px] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border-4 border-gray-800 relative transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">

              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-black rounded-full z-20" />

              <div className="w-full h-full bg-[#1A1A1A] rounded-[32px] overflow-hidden relative flex flex-col justify-between p-4 pt-10">

                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="font-black text-sm tracking-wider text-sv-blue">THE 70S APP</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                <div className="my-auto space-y-4 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cupom Ativo 🎫</p>
                  <h5 className="text-xl font-black tracking-tight leading-tight text-white">TENHA DESCONTOS EM PRODUTOS</h5>

                  <div className="w-full h-40 relative my-2 transform scale-110">
                    <Image
                      src="/hb2.png"
                      alt="Burger no App"
                      fill
                      className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 px-2 leading-relaxed">
                    Descontos exclusivos em produtos selecionados, direto pelo aplicativo.
                  </p>
                </div>

                <div className="w-full bg-sv-blue text-white text-center py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
                  Resgatar Cupom
                </div>

              </div>
            </div>

          </div>

          <div className="flex flex-col justify-center space-y-6 text-center md:text-left order-1 md:order-2">

            <span className="text-sm font-black tracking-widest text-sv-dark uppercase bg-white px-4 py-1.5 rounded-full inline-block self-center md:self-start shadow-sm">
              Em breve 🚧
            </span>

            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] uppercase drop-shadow-md text-white">
              Nosso App <br />
              e Clube de Vantagens <br />
              estão a caminho!
            </h3>

            <p className="text-lg md:text-xl font-medium text-red-100 tracking-wide max-w-md">
              Cupons exclusivos, acompanhamento de pedido em tempo real e pontos trocáveis por hambúrgueres grátis. Ainda estamos definindo os detalhes — fique de olho.
            </p>
          </div>

        </div>
      </div>
    </section>

  );
}