'use client';

import { useMemo, useState } from 'react';
import { formatarBRL } from '@/lib/comanda/formato';

export default function SeletorProdutos({ produtos, categorias = [], adicionaisDisponiveis = [], onAdicionar }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');
  const [produtoEmSelecao, setProdutoEmSelecao] = useState(null);
  const [selecionados, setSelecionados] = useState([]);

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

  function clicarProduto(produto) {
    const adicionaisDoProduto = adicionaisDisponiveis.filter((a) => a.produto_id === produto.id);

    if (adicionaisDoProduto.length === 0) {
      onAdicionar(produto, []);
      return;
    }

    setProdutoEmSelecao(produto);
    setSelecionados([]);
  }

  function toggleSelecionado(adicional) {
    setSelecionados((atual) =>
      atual.some((a) => a.id === adicional.id)
        ? atual.filter((a) => a.id !== adicional.id)
        : [...atual, adicional]
    );
  }

  function confirmarSelecao() {
    onAdicionar(produtoEmSelecao, selecionados);
    setProdutoEmSelecao(null);
    setSelecionados([]);
  }

  const adicionaisDoProdutoEmSelecao = produtoEmSelecao
    ? adicionaisDisponiveis.filter((a) => a.produto_id === produtoEmSelecao.id)
    : [];

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
        {produtosFiltrados.map((produto) => (
          <button
            key={produto.id}
            type="button"
            onClick={() => clicarProduto(produto)}
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
        ))}

        {produtosFiltrados.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm font-medium py-8">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      {produtoEmSelecao && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Adicionar</p>
              <h3 className="text-xl font-black text-sv-dark uppercase tracking-tight">
                {produtoEmSelecao.nome}
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              {adicionaisDoProdutoEmSelecao.map((adicional) => (
                <label
                  key={adicional.id}
                  className="flex items-center gap-2 text-sm font-medium text-sv-dark p-2.5 rounded-xl bg-[#F7F7F7] border border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.some((a) => a.id === adicional.id)}
                    onChange={() => toggleSelecionado(adicional)}
                  />
                  <span className="flex-1">{adicional.nome}</span>
                  <span className="text-gray-400">+{formatarBRL(adicional.preco)}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setProdutoEmSelecao(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sv-dark font-black uppercase tracking-wider text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarSelecao}
                className="flex-1 py-3 rounded-xl bg-sv-blue hover:bg-sv-red text-white font-black uppercase tracking-wider text-xs transition-colors duration-150"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
