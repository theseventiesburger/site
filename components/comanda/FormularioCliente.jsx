'use client';

import { useState } from 'react';
import { criarCliente, atualizarCliente } from '@/lib/comanda/clientes';

export default function FormularioCliente({ supabase, cliente, onFechar, onSalvo }) {
  const modoEdicao = Boolean(cliente);

  const [nome, setNome] = useState(cliente?.nome ?? '');
  const [telefone, setTelefone] = useState(cliente?.telefone ?? '');
  const [endereco, setEndereco] = useState(cliente?.endereco ?? '');
  const [dataNascimento, setDataNascimento] = useState(cliente?.data_nascimento ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar(e) {
    e.preventDefault();
    if (!nome) {
      setErro('Preencha o nome.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const dados = { nome, telefone, endereco, dataNascimento };
      if (modoEdicao) {
        await atualizarCliente(supabase, cliente.id, dados);
      } else {
        await criarCliente(supabase, dados);
      }
      onSalvo();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <form
        onSubmit={salvar}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-4 my-auto"
      >
        <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight">
          {modoEdicao ? 'Editar cliente' : 'Novo cliente'}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Telefone</label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Data de nascimento</label>
            <input
              type="date"
              value={dataNascimento ?? ''}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Endereço</label>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
          />
        </div>

        {erro && (
          <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 py-3 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
