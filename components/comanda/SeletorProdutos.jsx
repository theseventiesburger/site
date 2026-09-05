'use client';

import { useMemo, useState } from 'react';
import { formatarBRL } from '@/lib/comanda/formato';

export default function SeletorProdutos({ produtos, categorias = [], onAdicionar }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');

  const categoriasComTodos = useMemo(
    () => [{ id: 'todos', nome: 'Todos', emoji: '🍔' }, ...categorias],
    [categorias]
  );

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const bateCategoria = categoriaAtiva === 'todos' || p.categoria_id === categoriaAtiva;
      const bateBusca = p.nome.toLowerCase().includes(busca.trim().toLowerCase());
      return bateCategoria && bateBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue transition-colors duration-150"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categoriasComTodos.map((cat) => {
          const ativa = categoriaAtiva === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-200 ${
                ativa
                  ? 'bg-sv-dark text-white'
                  : 'bg-[#F7F7F7] text-sv-dark border border-gray-200 hover:border-sv-blue'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.nome}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
        {produtosFiltrados.map((produto) => {
          const tamanhos = [...(produto.produto_tamanhos ?? [])].sort((a, b) => a.ordem - b.ordem);

          if (tamanhos.length > 0) {
            return (
              <div key={produto.id} className="flex flex-col gap-2 p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100">
                <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate">{produto.nome}</p>
                <div className="flex flex-wrap gap-2">
                  {tamanhos.map((tamanho) => (
                    <button
                      key={tamanho.id}
                      type="button"
                      onClick={() => onAdicionar(produto, [], tamanho)}
                      className="flex flex-col items-center px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-sv-blue transition-colors duration-150"
                    >
                      <span className="text-xs font-black uppercase text-sv-dark">{tamanho.nome}</span>
                      <span className="text-[10px] font-bold text-gray-400">{formatarBRL(tamanho.preco)}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <button
              key={produto.id}
              type="button"
              onClick={() => onAdicionar(produto, [])}
              className="flex items-center justify-between gap-3 p-4 bg-[#F7F7F7] rounded-2xl border border-gray-100 hover:border-sv-blue transition-colors duration-150 text-left group"
            >
              <div className="min-w-0">
                <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate group-hover:text-sv-blue transition-colors duration-150">
                  {produto.nome}
                </p>
                <p className="text-gray-400 text-xs font-bold mt-1">{formatarBRL(produto.preco)}</p>
              </div>
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sv-blue text-white font-black text-lg flex items-center justify-center group-hover:bg-sv-red transition-colors duration-150">
                +
              </span>
            </button>
          );
        })}

        {produtosFiltrados.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm font-medium py-8">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
