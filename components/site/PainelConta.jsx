'use client';

import { useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { atualizarMeuCadastro } from '@/lib/site/clientes';
import { formatarTelefone } from '@/lib/comanda/formato';
import { sairCliente } from '@/app/(site)/conta/actions';

export default function PainelConta({ cliente, email, bairros }) {
  const [supabase] = useState(() => criarClienteBrowser());

  if (!cliente) {
    return (
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-3">
        <p className="text-sv-dark font-bold text-sm">
          Não achamos seu cadastro de cliente vinculado a essa conta ({email}).
        </p>
        <p className="text-gray-400 text-xs font-medium">Fale com a gente pelo WhatsApp pra resolver.</p>
        <BotaoSair />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PainelContaFormulario cliente={cliente} email={email} bairros={bairros} supabase={supabase} />
      <div className="flex justify-end">
        <BotaoSair />
      </div>
    </div>
  );
}

// Fora de qualquer <form> de propósito — HTML não permite <form> dentro de
// <form>, e isso já causou comportamento inconsistente (bug corrigido).
function BotaoSair() {
  return (
    <form action={sairCliente}>
      <button
        type="submit"
        className="py-3 px-6 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-xs hover:border-sv-red hover:text-sv-red transition-colors duration-150"
      >
        Sair
      </button>
    </form>
  );
}

function PainelContaFormulario({ cliente, email, bairros, supabase }) {
  const [nome, setNome] = useState(cliente?.nome ?? '');
  const [telefone, setTelefone] = useState(cliente?.telefone ?? '');
  const [endereco, setEndereco] = useState(cliente?.endereco ?? '');
  const [bairroId, setBairroId] = useState(cliente?.bairro_id ?? '');
  const [pontoReferencia, setPontoReferencia] = useState(cliente?.ponto_referencia ?? '');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      await atualizarMeuCadastro(supabase, cliente.id, { nome, telefone, endereco, bairroId, pontoReferencia });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 4000);
    } catch (err) {
      console.error(err);
      setErro(err.message || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
      {salvo && (
        <p className="text-green-700 text-sm font-bold bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          ✓ Dados salvos com sucesso!
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">E-mail</label>
        <p className="text-sv-dark font-bold text-sm">{email}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Telefone</label>
        <input
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          placeholder="(35) 99277-6777"
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Endereço padrão</label>
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Rua, número"
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={bairroId}
          onChange={(e) => setBairroId(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
        >
          <option value="">Bairro</option>
          {bairros.map((b) => (
            <option key={b.id} value={b.id}>{b.nome}</option>
          ))}
        </select>
        <input
          value={pontoReferencia}
          onChange={(e) => setPontoReferencia(e.target.value)}
          placeholder="Ponto de referência"
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
        />
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">{erro}</p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="bg-sv-blue hover:bg-sv-red text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
      >
        {salvando ? 'Salvando...' : 'Salvar dados'}
      </button>
    </form>
  );
}
