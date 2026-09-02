'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { listarClientes } from '@/lib/comanda/clientes';
import { formatarDataNascimento } from '@/lib/comanda/formato';
import FormularioCliente from '@/components/comanda/FormularioCliente';

export default function PainelClientes({ clientesIniciais }) {
  const [supabase] = useState(() => criarClienteBrowser());
  const [clientes, setClientes] = useState(clientesIniciais);
  const [busca, setBusca] = useState('');
  const [clienteEmEdicao, setClienteEmEdicao] = useState(undefined); // undefined = fechado, null = criar, objeto = editar

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(termo) || (c.telefone ?? '').includes(termo)
    );
  }, [clientes, busca]);

  async function recarregar() {
    setClientes(await listarClientes(supabase));
    setClienteEmEdicao(undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="flex-1 min-w-[220px] px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue transition-colors duration-150"
        />
        <button
          type="button"
          onClick={() => setClienteEmEdicao(null)}
          className="bg-sv-blue hover:bg-sv-red text-white font-black px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
        >
          + Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clientesFiltrados.map((cliente) => (
          <div key={cliente.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate">{cliente.nome}</p>
              <span className="flex-shrink-0 bg-sv-blue/10 text-sv-blue text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                {cliente.pedidos?.[0]?.count ?? 0} pedidos
              </span>
            </div>
            {cliente.telefone && <p className="text-gray-500 text-xs font-bold">{cliente.telefone}</p>}
            {cliente.endereco && <p className="text-gray-400 text-xs font-medium truncate">{cliente.endereco}</p>}
            {cliente.data_nascimento && (
              <p className="text-gray-400 text-xs font-medium">Nasc. {formatarDataNascimento(cliente.data_nascimento)}</p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <Link
                href={`/comanda/clientes/${cliente.id}`}
                className="text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red transition-colors duration-150"
              >
                Ver relatório
              </Link>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => setClienteEmEdicao(cliente)}
                className="text-[10px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red transition-colors duration-150"
              >
                Editar
              </button>
            </div>
          </div>
        ))}

        {clientesFiltrados.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm font-medium py-8">
            Nenhum cliente encontrado.
          </p>
        )}
      </div>

      {clienteEmEdicao !== undefined && (
        <FormularioCliente
          supabase={supabase}
          cliente={clienteEmEdicao}
          onFechar={() => setClienteEmEdicao(undefined)}
          onSalvo={recarregar}
        />
      )}
    </div>
  );
}
