import FormularioRedefinirSenha from "@/components/site/FormularioRedefinirSenha";

export default function RedefinirSenhaPage() {
  return (
    <section className="w-full flex-1 flex items-center justify-center bg-[#F7F7F7] px-6 pt-32 pb-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-3">Minha Conta</span>
          <h1 className="text-3xl font-black text-sv-dark uppercase tracking-tighter leading-none">Nova Senha</h1>
        </div>

        <FormularioRedefinirSenha />
      </div>
    </section>
  );
}
