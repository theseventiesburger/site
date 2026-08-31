import HeroSlider from '@/components/HeroSlider';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const campeoes = [
    {
      id: "new-castle",
      nome: "New Castle",
      tag: "O Mais Pedido 🔥",
      imagem: "/hb2.png",
      descricao: "Hambúrguer de 160g grelhado na brasa, ovo frito perfeito, bacon super crocante, queijo muçarela derretido e a nossa exclusiva maionese da casa, servidos num pão de gergelim incrivelmente macio.",
      preco: "R$ 34,90"
    },
    {
      id: "metro-black",
      nome: "Metro Black",
      tag: "Clássico Perfeito 👑",
      imagem: "/hb2.png",
      descricao: "Hambúrguer de 160g suculento, alface americana fresca, tomate selecionado, queijo muçarela derretido e maionese artesanal da casa, tudo isso num pão de gergelim super macio.",
      preco: "R$ 31,90"
    },
    {
      id: "gorgon",
      nome: "Gorgon",
      tag: "Premium Especial 🌟",
      imagem: "/hb2.png",
      descricao: "Hambúrguer de 160g, a intensidade marcante do queijo gorgonzola, rúcula fresca colhida no dia, um fio de mel silvestre, muita cebola crispy crocante e maionese da casa num pão de gergelim macio.",
      preco: "R$ 38,90"
    }
  ];

  return (
    <section className="w-full bg-[#F7F7F7]">
      <HeroSlider />

      <div className="max-w-7xl mx-auto px-6 pt-24">

        <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
          <h3 className="text-4xl md:text-5xl font-black text-sv-dark tracking-tighter uppercase">
            Nossos Campeões de Vendas
          </h3>
          <div className="w-24 h-1.5 bg-sv-red rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {campeoes.map((burger) => (
            <div
              key={burger.id}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group relative text-left min-h-[500px]"
            >
              <div className="relative w-full flex flex-col items-center">
                <span className="absolute top-0 right-0 bg-sv-dark text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10">
                  {burger.tag}
                </span>

                <div className="w-full h-48 relative mt-6 transform transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={burger.imagem}
                    alt={burger.nome}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]"
                    priority
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col flex-grow">
                <h4 className="text-2xl font-black text-sv-dark tracking-tight uppercase group-hover:text-sv-blue transition-colors duration-200">
                  {burger.nome}
                </h4>
                <p className="text-gray-500 font-medium text-sm mt-3 leading-relaxed flex-grow">
                  {burger.descricao}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preço</span>
                  <span className="text-2xl font-black text-sv-dark">{burger.preco}</span>
                </div>

                <Link
                  href={`/pedido/${burger.id}`}
                  className="bg-sv-blue text-white font-black px-6 py-3 rounded-xl shadow-md transition-all duration-200 hover:bg-sv-red hover:scale-105 tracking-wide uppercase text-xs text-center"
                >
                  Eu quero
                </Link>
              </div>

            </div>
          ))}
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
                  <h5 className="text-xl font-black tracking-tight leading-tight text-white">GANHE 1 BATATA RÚSTICA</h5>

                  <div className="w-full h-40 relative my-2 transform scale-110">
                    <Image
                      src="/hb2.png"
                      alt="Burger no App"
                      fill
                      className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 px-2 leading-relaxed">
                    Na primeira compra pelo aplicativo. Válido por tempo limitado.
                  </p>
                </div>

                <div className="w-full bg-sv-blue text-white text-center py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
                  Resgatar Cupom
                </div>

              </div>
            </div>

          </div>

          <div className="flex flex-col justify-center space-y-6 text-center md:text-left order-1 md:order-2">

            <span className="text-sm font-black tracking-widest text-sv-blue uppercase bg-white px-4 py-1.5 rounded-full inline-block self-center md:self-start shadow-sm">
              Clube de Vantagens 🚀
            </span>

            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] uppercase drop-shadow-md text-white">
              Baixe nosso App <br />
              e tenha os anos 70 <br />
              na palma da mão!
            </h3>

            <p className="text-lg md:text-xl font-medium text-red-100 tracking-wide max-w-md">
              Garanta cupons exclusivos, acompanhe seu pedido em tempo real e acumule pontos para trocar por hambúrgueres grátis.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">

              <a
                href="https://www.apple.com/br/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-2.5 flex items-center gap-3 transition-all duration-200 shadow-xl hover:scale-105 w-44"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.27-.56 2.94-1.43z" />
                </svg>
                <div className="text-left flex flex-col leading-tight">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Disponível na</span>
                  <span className="text-sm font-black tracking-tight">App Store</span>
                </div>
              </a>

              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-2.5 flex items-center gap-3 transition-all duration-200 shadow-xl hover:scale-105 w-44"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.783 12 3.609 22.186A2.238 2.238 0 0 1 3 20.583V3.417a2.238 2.238 0 0 1 .609-1.603zm11.29 9.07l3.292-1.902c.86-.497.86-1.312 0-1.809l-3.292-1.902-3.025 3.025 3.025 3.025zm-4.14-4.14L3.987 2.115A1.336 1.336 0 0 1 4.796 2c.381 0 .753.104 1.08.3 l8.033 4.636-3.15 3.15zm0 10.512l3.15 3.15-8.033 4.636a2.13 2.13 0 0 1-1.08.3c-.287 0-.57-.04-.829-.115l6.792-4.633z" />
                </svg>
                <div className="text-left flex flex-col leading-tight">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">DISPONÍVEL NO</span>
                  <span className="text-sm font-black tracking-tight">Google Play</span>
                </div>
              </a>

            </div>

          </div>

        </div>
      </div>
    </section>

  );
}