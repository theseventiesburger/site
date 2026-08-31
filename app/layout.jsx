import "./globals.css";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata = {
  title: "The Seventies Burger",
  description: "A opção mais deliciosa da cidade",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={`${poppins.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
