import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { CarrinhoProvider } from "@/components/site/CarrinhoContext";

export default function SiteLayout({ children }) {
  return (
    <CarrinhoProvider>
      <Navbar />
      {children}
      <Footer />
    </CarrinhoProvider>
  );
}
