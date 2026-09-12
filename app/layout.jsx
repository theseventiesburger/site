import "./globals.css";

import { Poppins } from "next/font/google";
import RegistrarServiceWorker from "@/components/site/RegistrarServiceWorker";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const SITE_URL = "https://www.theseventiesburger.com.br";
const TITULO = "The Seventies Burger";
const DESCRICAO = "Hamburgueria artesanal em São Lourenço - MG. Cardápio, cupons exclusivos e delivery — peça pelo site, WhatsApp ou UaiRango.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITULO,
    template: `%s — ${TITULO}`,
  },
  description: DESCRICAO,
  manifest: "/manifest.json",
  keywords: ["hamburgueria", "hambúrguer artesanal", "delivery São Lourenço MG", "The Seventies Burger"],
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: SITE_URL,
    siteName: TITULO,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: TITULO }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={`${poppins.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
