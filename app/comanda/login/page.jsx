import LoginForm from "@/components/comanda/LoginForm";

export default async function ComandaLoginPage({ searchParams }) {
  const params = await searchParams;
  const proximo = typeof params?.proximo === "string" ? params.proximo : "/comanda";

  return (
    <section className="w-full flex-1 flex items-center justify-center relative overflow-hidden bg-sv-dark px-6 py-16">
      <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-white opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -left-24 -top-24 w-72 h-72 bg-sv-red opacity-10 rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-3">
            Área da equipe
          </span>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
            Comanda <span className="text-sv-red">Eletrônica</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-3">
            Entre com sua conta para lançar e acompanhar pedidos.
          </p>
        </div>

        <LoginForm proximo={proximo} />
      </div>
    </section>
  );
}
