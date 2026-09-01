// components/Footer.jsx
import Image from 'next/image';
import Link from 'next/link';
import GoogleRatingBadge from '@/components/GoogleRatingBadge';

export default function Footer() {
  const linksNavegacao = [
    { label: "Início", href: "/" },
    { label: "Cupons", href: "/cupons" },
    { label: "Cardápio", href: "/cardapio" },
    { label: "App", href: "/appseventies" },
    { label: "Clube", href: "/clube" },
    { label: "Delivery", href: "/delivery" },
    { label: "Contato", href: "/contato" }
  ];

  const linksLegais = [
    { label: "Diretrizes de Privacidade", href: "/privacidade" },
    { label: "Regulamento do Clube 70s", href: "/regulamento-clube" },
    { label: "Informações Legais", href: "/informacoes-legais" }
  ];

  return (
    <footer className="w-full bg-sv-dark text-white pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        
        <div className="relative w-24 h-24 mb-10 transform transition-transform duration-300 hover:scale-105">
          <Image
            src="/logo.png"
            alt="The Seventies Burger"
            fill
            className="object-contain"
          />
        </div>

        <GoogleRatingBadge className="mb-8" />

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
          {linksNavegacao.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.href}
              className="text-base font-bold hover:text-sv-blue transition-colors duration-200 uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-10 max-w-3xl">
          {linksLegais.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.href}
              className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="w-full h-px bg-gray-800 my-2 max-w-4xl" />

        <div className="flex flex-col items-center space-y-3 mt-6 mb-8">
          <span className="text-sm font-black uppercase tracking-widest text-sv-red">
            Compartilhe algo delicioso
          </span>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/theseventiesburgers" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            
            <a href="https://www.facebook.com/theseventies.burger/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 max-w-2xl leading-relaxed">
          Sujeito à disponibilidade de estoque. Imagens meramente ilustrativas. TM & © 2026 The Seventies Burger Company LLC. Todos os direitos reservados. Desenvolvido com foco em alta performance pela <a href="https://rixxer.com.br" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">Rixxer</a>.
        </p>

      </div>
    </footer>
  );
}