'use client';

import { useState } from 'react';
import { formatarBRL } from '@/lib/comanda/formato';
import { PONTOS_CARNE, PONTO_CARNE_LABEL } from '@/lib/comanda/constantes';
import { buscarCupomPorCodigo } from '@/lib/comanda/cupons';

function validarCupom(cupom, subtotal) {
  const hoje = new Date().toISOString().slice(0, 10);
  if (!cupom) return 'Cupom não encontrado.';
  if (!cupom.ativo) return 'Cupom inativo.';
  if (cupom.valido_de && hoje < cupom.valido_de) return 'Cupom ainda não é válido.';
  if (cupom.valido_ate && hoje > cupom.valido_ate) return 'Cupom expirado.';
  if (cupom.limite_uso && cupom.usos_realizados >= cupom.limite_uso) return 'Cupom atingiu o limite de usos.';
  if (Number(cupom.valor_minimo_pedido) > subtotal) {
    return `Pedido mínimo de ${formatarBRL(cupom.valor_minimo_pedido)} para esse cupom.`;
  }
  return null;
}

function calcularDesconto(cupom, subtotal, taxaEntrega) {
  if (!cupom) return 0;
  if (cupom.tipo_desconto === 'percentual') return Math.round(subtotal * (cupom.valor / 100) * 100) / 100;
  return Math.min(Number(cupom.valor), subtotal + taxaEntrega);
}

function categoriaGratuitaAgora(categoria, tipoPedido) {
  return Boolean(categoria?.gratuita_tipos?.includes(tipoPedido));
}

function precoAdicional(adicional, tipoPedido) {
  return categoriaGratuitaAgora(adicional.categorias_adicionais, tipoPedido) ? 0 : Number(adicional.preco);
}

function precoComAdicionais(item, tipoPedido) {
  const somaAdicionais = (item.adicionaisSelecionados ?? []).reduce(
    (soma, a) => soma + precoAdicional(a, tipoPedido),
    0
  );
  return Number(item.precoUnitario) + somaAdicionais;
}

// Nem todo produto recebe todo adicional (cerveja não recebe queijo, por
// exemplo) — adicional sem categoria continua liberado pra qualquer item.
function adicionaisParaItem(adicionaisDisponiveis, item) {
  const permitidas = item.categoriasAdicionaisPermitidas;
  if (!permitidas) return adicionaisDisponiveis;
  return adicionaisDisponiveis.filter(
    (adicional) => !adicional.categoria_id || permitidas.includes(adicional.categoria_id)
  );
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
  supabase,
  itens,
  tipoPedido,
  adicionaisDisponiveis = [],
  taxaEntrega = 0,
  onQuantidade,
  onObservacao,
  onPontoCarne,
  onAdicionais,
  onRemover,
  onCupomAplicado,
}) {
  const subtotal = itens.reduce((soma, item) => soma + precoComAdicionais(item, tipoPedido) * item.quantidade, 0);

  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [erroCupom, setErroCupom] = useState(null);
  const [verificandoCupom, setVerificandoCupom] = useState(false);

  // Recalculado a cada render em vez de sincronizado por efeito: se o
  // carrinho mudar depois do cupom aplicado (item removido, por exemplo) e
  // o pedido mínimo deixar de valer, o desconto zera sozinho sem precisar
  // de um useEffect reagindo ao subtotal.
  const avisoCupomInvalido = cupomAplicado ? validarCupom(cupomAplicado, subtotal) : null;
  const cupomValido = avisoCupomInvalido ? null : cupomAplicado;

  async function aplicarCupom() {
    if (!cupomInput.trim()) return;
    setVerificandoCupom(true);
    setErroCupom(null);
    try {
      const cupom = await buscarCupomPorCodigo(supabase, cupomInput.trim());
      const mensagem = validarCupom(cupom, subtotal);
      if (mensagem) {
        setErroCupom(mensagem);
        return;
      }
      setCupomAplicado(cupom);
      onCupomAplicado?.(cupom.codigo);
    } catch (err) {
      console.error(err);
      setErroCupom('Não foi possível verificar o cupom.');
    } finally {
      setVerificandoCupom(false);
    }
  }

  function removerCupom() {
    setCupomAplicado(null);
    setCupomInput('');
    setErroCupom(null);
    onCupomAplicado?.(null);
  }

  // Taxa de serviço (garçom): 10% nas vendas de mesa, aplicada sozinha pelo
  // servidor ao criar o pedido — só exibida aqui pro atendente já ver o
  // total real antes de enviar (dá pra tirar depois, na hora de fechar a
  // conta).
  const taxaServico = tipoPedido === 'mesa' ? Math.round(subtotal * 0.10 * 100) / 100 : 0;

  const desconto = calcularDesconto(cupomValido, subtotal, taxaEntrega || 0);
  const total = subtotal + (taxaEntrega || 0) + taxaServico - desconto;

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
            const adicionaisDoItem = adicionaisParaItem(adicionaisDisponiveis, item);
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
                    {formatarBRL(precoComAdicionais(item, tipoPedido) * item.quantidade)}
                  </span>
                </div>

                {adicionaisDoItem.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    {agruparPorCategoria(adicionaisDoItem).map(({ categoria, itens }) => {
                      if (categoriaGratuitaAgora(categoria, tipoPedido)) {
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

                <select
                  value={item.pontoCarne ?? ''}
                  onChange={(e) => onPontoCarne(idx, e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium focus:outline-none focus:border-sv-blue transition-colors duration-150"
                >
                  <option value="">Ponto da carne (se for o caso)</option>
                  {PONTOS_CARNE.map((ponto) => (
                    <option key={ponto} value={ponto}>{PONTO_CARNE_LABEL[ponto]}</option>
                  ))}
                </select>

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

      {cupomAplicado ? (
        <div
          className={`flex flex-col gap-1 px-4 py-3 rounded-xl border-2 border-dashed ${
            avisoCupomInvalido ? 'border-amber-300 bg-amber-50' : 'border-green-400 bg-green-50'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-black uppercase tracking-widest ${avisoCupomInvalido ? 'text-amber-700' : 'text-green-700'}`}>
              {avisoCupomInvalido ? '⚠' : '✓'} {cupomAplicado.codigo}
            </span>
            <button
              type="button"
              onClick={removerCupom}
              className={`text-[10px] font-black uppercase ${avisoCupomInvalido ? 'text-amber-700' : 'text-green-700'} hover:text-sv-red`}
            >
              Remover
            </button>
          </div>
          {avisoCupomInvalido && <p className="text-amber-700 text-[11px] font-bold">{avisoCupomInvalido}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cupomInput}
              onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
              placeholder="Código do cupom"
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-black uppercase tracking-wider focus:outline-none focus:border-sv-blue"
            />
            <button
              type="button"
              onClick={aplicarCupom}
              disabled={verificandoCupom || !cupomInput.trim()}
              className="flex-shrink-0 bg-sv-dark text-white font-black px-4 py-2.5 rounded-xl uppercase tracking-wider text-[11px] hover:bg-sv-blue transition-colors duration-150 disabled:opacity-40"
            >
              {verificandoCupom ? '...' : 'Aplicar'}
            </button>
          </div>
          {erroCupom && <p className="text-sv-red text-xs font-bold">{erroCupom}</p>}
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
        {taxaServico > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">Taxa de serviço (10%)</span>
            <span className="font-bold text-sv-dark">{formatarBRL(taxaServico)}</span>
          </div>
        )}
        {desconto > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 font-medium">Desconto</span>
            <span className="font-bold text-green-700">-{formatarBRL(desconto)}</span>
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
