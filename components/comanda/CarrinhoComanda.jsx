'use client';

import { formatarBRL } from '@/lib/comanda/formato';

function precoAdicional(adicional) {
  return adicional.categorias_adicionais?.gratuita ? 0 : Number(adicional.preco);
}

function precoComAdicionais(item) {
  const somaAdicionais = (item.adicionaisSelecionados ?? []).reduce((soma, a) => soma + precoAdicional(a), 0);
  return Number(item.precoUnitario) + somaAdicionais;
}

function agruparPorCategoria(adicionais) {
  const porCategoria = new Map();
  const semCategoria = [];

  for (const adicional of adicionais) {
    const cat = adicional.categorias_adicionais;
    if (!cat) {
      semCategoria.push(adicional);
      continue;
    }
    if (!porCategoria.has(cat.id)) porCategoria.set(cat.id, { categoria: cat, itens: [] });
    porCategoria.get(cat.id).itens.push(adicional);
  }

  const grupos = [...porCategoria.values()];
  if (semCategoria.length > 0) grupos.push({ categoria: null, itens: semCategoria });
  return grupos;
}

export default function CarrinhoComanda({
  itens,
  adicionaisDisponiveis = [],
  taxaEntrega = 0,
  onQuantidade,
  onObservacao,
  onAdicionais,
  onRemover,
}) {
  const subtotal = itens.reduce((soma, item) => soma + precoComAdicionais(item) * item.quantidade, 0);
  const total = subtotal + (taxaEntrega || 0);

  function toggleAdicional(idx, item, adicional) {
    const jaSelecionado = (item.adicionaisSelecionados ?? []).some((a) => a.id === adicional.id);
    const novaLista = jaSelecionado
      ? item.adicionaisSelecionados.filter((a) => a.id !== adicional.id)
      : [...(item.adicionaisSelecionados ?? []), adicional];
    onAdicionais(idx, novaLista);
  }

  // Categorias gratuitas (ex: Pães) são escolha única — selecionar uma
  // troca a anterior da mesma categoria em vez de acumular.
  function selecionarNaCategoria(idx, item, categoriaId, adicional) {
    const outros = (item.adicionaisSelecionados ?? []).filter((a) => a.categoria_id !== categoriaId);
    onAdicionais(idx, adicional ? [...outros, adicional] : outros);
  }

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Carrinho</h3>

      {itens.length === 0 ? (
        <p className="text-gray-400 text-sm font-medium py-6 text-center">
          Nenhum item adicionado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
          {itens.map((item, idx) => {
            return (
              <div key={idx} className="flex flex-col gap-2 p-3 bg-[#F7F7F7] rounded-xl border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate">
                      {item.nome}
                    </p>
                    <p className="text-gray-400 text-xs font-bold">{formatarBRL(item.precoUnitario)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemover(idx)}
                    className="flex-shrink-0 text-gray-400 hover:text-sv-red text-xs font-black uppercase transition-colors duration-150"
                  >
                    Remover
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onQuantidade(idx, Math.max(1, item.quantidade - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 font-black text-sv-dark hover:border-sv-blue transition-colors duration-150"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-black text-sm text-sv-dark">{item.quantidade}</span>
                  <button
                    type="button"
                    onClick={() => onQuantidade(idx, item.quantidade + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 font-black text-sv-dark hover:border-sv-blue transition-colors duration-150"
                  >
                    +
                  </button>
                  <span className="ml-auto font-black text-sm text-sv-dark">
                    {formatarBRL(precoComAdicionais(item) * item.quantidade)}
                  </span>
                </div>

                {adicionaisDisponiveis.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    {agruparPorCategoria(adicionaisDisponiveis).map(({ categoria, itens }) => {
                      if (categoria?.gratuita) {
                        const selecionadoId = (item.adicionaisSelecionados ?? []).find(
                          (a) => a.categoria_id === categoria.id
                        )?.id ?? '';
                        const nomeGrupo = `troca-${idx}-${categoria.id}`;

                        return (
                          <div key={categoria.id} className="flex flex-col gap-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {categoria.emoji ?? ''} {categoria.nome}{' '}
                              <span className="text-green-600 normal-case">· troca sem custo</span>
                            </p>
                            <label className="flex items-center gap-2 text-xs font-medium text-sv-dark">
                              <input
                                type="radio"
                                name={nomeGrupo}
                                checked={selecionadoId === ''}
                                onChange={() => selecionarNaCategoria(idx, item, categoria.id, null)}
                              />
                              Padrão (sem troca)
                            </label>
                            {itens.map((adicional) => (
                              <label key={adicional.id} className="flex items-center gap-2 text-xs font-medium text-sv-dark">
                                <input
                                  type="radio"
                                  name={nomeGrupo}
                                  checked={selecionadoId === adicional.id}
                                  onChange={() => selecionarNaCategoria(idx, item, categoria.id, adicional)}
                                />
                                {adicional.nome}
                                <span className="text-green-600">Grátis</span>
                              </label>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div key={categoria?.id ?? 'sem-categoria'} className="flex flex-col gap-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {categoria ? `${categoria.emoji ?? ''} ${categoria.nome}` : 'Outros'}
                          </p>
                          {itens.map((adicional) => {
                            const marcado = (item.adicionaisSelecionados ?? []).some((a) => a.id === adicional.id);
                            return (
                              <label key={adicional.id} className="flex items-center gap-2 text-xs font-medium text-sv-dark">
                                <input
                                  type="checkbox"
                                  checked={marcado}
                                  onChange={() => toggleAdicional(idx, item, adicional)}
                                />
                                {adicional.nome}
                                <span className="text-gray-400">+{formatarBRL(adicional.preco)}</span>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Observação (ex: sem cebola)"
                  value={item.observacao ?? ''}
                  onChange={(e) => onObservacao(idx, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium focus:outline-none focus:border-sv-blue transition-colors duration-150"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Subtotal</span>
          <span className="font-bold text-sv-dark">{formatarBRL(subtotal)}</span>
        </div>
        {taxaEntrega > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">Taxa de entrega</span>
            <span className="font-bold text-sv-dark">{formatarBRL(taxaEntrega)}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black text-sv-dark">{formatarBRL(total)}</span>
        </div>
      </div>
    </div>
  );
}
