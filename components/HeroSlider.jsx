"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HeroSlider() {
  const banners = [
    {
      id: 1,
      titulo: "O AUTÊNTICO\nSABOR ARTESANAL",
      subtitulo: "Seus desejos de 1970, realizados hoje.",
      imagem: "/hb1.png",
      estiloFundo: "bg-[#161616] bg-gradient-to-r from-[#121212] via-transparent to-[#121212]",
    },
    {
      id: 2,
      titulo: "COMBO\nTHE SEVENTIES",
      subtitulo: "Hambúrguer duplo, batata rústica e refri gelado.",
      imagem: "/hb2.png",
      estiloFundo: "bg-[#990B0B] bg-gradient-to-r from-[#730808] via-transparent to-[#730808]",
    }
  ];

  return (
    <div className="w-full h-[550px] md:h-[650px] lg:h-[750px] overflow-hidden relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className={`w-full h-full flex items-center justify-center text-white relative px-6 md:px-12 py-12 md:py-20 ${banner.estiloFundo}`}>

              <div
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1470&auto=format&fit=crop')`
                }}
              />

              <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full z-10">

                <div className="flex flex-col justify-center space-y-6 text-center md:text-left order-2 md:order-1 lg:pr-10">
                  <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] whitespace-pre-line drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    {banner.titulo}
                  </h2>
                  <p className="text-lg md:text-2xl font-medium text-gray-200 tracking-wide max-w-md mx-auto md:mx-0">
                    {banner.subtitulo}
                  </p>
                  <div className="pt-4">
                    <button className="bg-[#0026E6] text-white font-black text-xl px-12 py-5 rounded-full shadow-2xl hover:bg-white hover:text-[#0026E6] hover:scale-105 transition-all duration-300 tracking-widest uppercase">
                      Peça Agora
                    </button>
                  </div>
                </div>

                <div className="w-full h-full flex items-center justify-center order-1 md:order-2 relative py-12">
                  <div className="w-full h-full relative transform scale-110 md:scale-125 lg:scale-135 transition-transform duration-700 hover:rotate-2">
                    <Image
                      src={banner.imagem}
                      alt={banner.titulo}
                      fill
                      priority={banner.id === 1}
                      className="object-contain drop-shadow-[0_35px_40px_rgba(0,0,0,0.85)]"
                    />
                  </div>
                </div>

              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev { 
          color: #ffffff !important; 
          background: rgba(0,0,0,0.4);
          width: 55px !important;
          height: 55px !important;
          border-radius: 50%;
          transform: scale(0.6);
          transition: all 0.3s ease;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover { background: #0026E6; transform: scale(0.75); }
        .swiper-pagination-bullet { background: #ffffff !important; height: 4px !important; width: 20px !important; border-radius: 2px !important; opacity: 0.3; }
        .swiper-pagination-bullet-active { background: #0026E6 !important; opacity: 1; width: 40px !important; }
      `}</style>
    </div>
  );
}