'use client';

import { useState } from 'react';

export default function PainelCatalogoUairango() {
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  async function sincronizar() {
    setEnviando(true);
    setErro(null);
    setResultado(null);
    try {
      const resposta = await fetch('/api/uairango/catalogo/sincronizar', { method: 'POST' });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao sincronizar.');
      setResultado(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-black text-sv-dark text-sm uppercase tracking-tight">Cardápio</h2>
        <p className="text-gray-500 text-xs font-medium mt-1">
          Envia categorias e produtos ativos pro catálogo do UaiRango. Adicionais não são sincronizados ainda.
        </p>
      </div>

      <button
        type="button"
        onClick={sincronizar}
        disabled={enviando}
        className="bg-sv-blue hover:bg-sv-red text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
      >
        {enviando ? 'Sincronizando...' : 'Sincronizar cardápio'}
      </button>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          {erro}
        </p>
      )}

      {resultado && (
        <div className="text-xs font-bold bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex flex-col gap-1">
          <span className="text-green-700">
            {resultado.categoriasCriadas} categoria(s) nova(s), {resultado.itensSincronizados} produto(s) sincronizado(s).
          </span>
          {resultado.erros?.length > 0 && (
            <ul className="text-sv-red list-disc pl-4">
              {resultado.erros.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
