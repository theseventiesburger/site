import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { CarrinhoProvider } from "@/components/site/CarrinhoContext";

// Dados estruturados (schema.org/Restaurant) — é o que deixa o Google
// mostrar horário, endereço e telefone direto no resultado de busca (rich
// snippet), sem depender só do Google Business Profile. Só nas páginas
// públicas (não em /comanda, que tem o próprio layout).
const dadosEstruturados = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "The Seventies Burger",
  image: "https://www.theseventiesburger.com.br/og-image.png",
  url: "https://www.theseventiesburger.com.br",
  telephone: "+5535992776777",
  servesCuisine: "Hamburgueria",
  priceRange: "R$20-R$60",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Wenceslau Braz, 167 — Centro",
    addressLocality: "São Lourenço",
    addressRegion: "MG",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday"],
      opens: "19:00",
      closes: "23:59",
    },
  ],
  sameAs: [
    "https://www.instagram.com/theseventiesburgers",
    "https://www.facebook.com/theseventies.burger/",
  ],
};

export default function SiteLayout({ children }) {
  return (
    <CarrinhoProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
      />
      <Navbar />
      {children}
      <Footer />
    </CarrinhoProvider>
  );
}
