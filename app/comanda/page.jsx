import Image from "next/image";

export default function ComandaHomePage() {
  return (
    <section className="w-full flex-1 flex items-center justify-center px-6">
      <div className="w-56 h-56 md:w-72 md:h-72 relative">
        <Image
          src="/logo.png"
          alt="The Seventies Artesanal Burger"
          fill
          priority
          className="object-contain drop-shadow-xl"
        />
      </div>
    </section>
  );
}
