import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
