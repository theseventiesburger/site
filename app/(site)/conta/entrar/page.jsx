import FormularioEntrar from "@/components/site/FormularioEntrar";

export default async function EntrarPage({ searchParams }) {
  const params = await searchParams;
  const proximo = typeof params?.proximo === "string" ? params.proximo : "/conta";

  return (
    <section className="w-full flex-1 flex items-center justify-center bg-[#F7F7F7] px-6 pt-32 pb-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-3">Minha Conta</span>
          <h1 className="text-3xl font-black text-sv-dark uppercase tracking-tighter leading-none">Entrar</h1>
          <p className="text-gray-500 text-sm font-medium mt-3">
            Entre pra finalizar seu pedido com endereço já salvo.
          </p>
        </div>

        <FormularioEntrar proximo={proximo} />
      </div>
    </section>
  );
}
