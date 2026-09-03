'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { useCarrinho } from '@/components/site/CarrinhoContext';
import { listarBairrosPublico, criarPedidoSite } from '@/lib/site/pedidos';
import { gerarPixCopiaECola } from '@/lib/site/pix';
import { formatarBRL, formatarTelefone } from '@/lib/comanda/formato';
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

export default function CarrinhoPage() {
  const [supabase] = useState(() => criarClienteBrowser());
  const { itens, alterarQuantidade, remover, limpar, subtotal } = useCarrinho();

  const [bairros, setBairros] = useState([]);
  const [bairroId, setBairroId] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [erroCupom, setErroCupom] = useState(null);
  const [verificandoCupom, setVerificandoCupom] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  useEffect(() => {
    listarBairrosPublico(supabase).then(setBairros).catch(() => {});
  }, [supabase]);

  const bairro = bairros.find((b) => b.id === bairroId);
  const taxaEntrega = Number(bairro?.valor_entrega ?? 0);

  const avisoCupomInvalido = cupomAplicado ? validarCupom(cupomAplicado, subtotal) : null;
  const cupomValido = avisoCupomInvalido ? null : cupomAplicado;
  const desconto = calcularDesconto(cupomValido, subtotal, taxaEntrega);
  const total = subtotal + taxaEntrega - desconto;

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
  }

  async function finalizarPedido(e) {
    e.preventDefault();
    if (!bairroId) {
      setErro('Selecione seu bairro.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const resultado = await criarPedidoSite(supabase, {
        nome,
        telefone,
        endereco,
        bairroId,
        pontoReferencia,
        observacoes,
        cupomCodigo: cupomValido?.codigo || null,
        itens: itens.map((i) => ({ produto_id: i.produtoId, quantidade: i.quantidade })),
      });
      setPedidoConfirmado(resultado);
      limpar();
    } catch (err) {
      console.error(err);
      setErro(err.message || 'Não foi possível enviar o pedido. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (pedidoConfirmado) {
    return <ConfirmacaoPedido pedido={pedidoConfirmado} />;
  }

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="text-sv-blue text-xs font-black tracking-[0.3em] uppercase mb-2 block">
          Finalizar Pedido
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-sv-dark uppercase tracking-tighter leading-none mb-8">
          Seu Carrinho
        </h1>

        {itens.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-12 text-center">
            <span className="text-5xl mb-4 block">🛒</span>
            <h2 className="text-xl font-black text-sv-dark uppercase tracking-tight mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 text-sm font-medium mb-6">Dá uma olhada no nosso cardápio e monte seu pedido.</p>
            <Link
              href="/cardapio"
              className="inline-block bg-sv-blue text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-red transition-colors duration-150"
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5 flex flex-col gap-4">
                {itens.map((item) => (
                  <div key={item.produtoId} className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-[#F7F7F7] flex-shrink-0">
                      <Image src={item.imagem} alt={item.nome} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sv-dark text-sm uppercase tracking-tight truncate">{item.nome}</p>
                      <p className="text-gray-400 text-xs font-bold">{formatarBRL(item.preco)} un.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.produtoId, -1)}
                        className="w-7 h-7 rounded-full border border-gray-200 text-sv-dark font-black flex items-center justify-center hover:border-sv-blue"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-black text-sv-dark text-sm">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.produtoId, 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 text-sv-dark font-black flex items-center justify-center hover:border-sv-blue"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-20 text-right font-black text-sv-dark text-sm flex-shrink-0">
                      {formatarBRL(item.preco * item.quantidade)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remover(item.produtoId)}
                      className="text-sv-red text-xs font-black flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={finalizarPedido} className="bg-white rounded-3xl shadow-md border border-gray-100 p-5 flex flex-col gap-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Seus dados</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    required
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
                  />
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(35) 99277-6777"
                    required
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
                  />
                </div>

                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número"
                  required
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={bairroId}
                    onChange={(e) => setBairroId(e.target.value)}
                    required
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
                  >
                    <option value="">Selecione o bairro</option>
                    {bairros.map((b) => (
                      <option key={b.id} value={b.id}>{b.nome} — {formatarBRL(b.valor_entrega)}</option>
                    ))}
                  </select>
                  <input
                    value={pontoReferencia}
                    onChange={(e) => setPontoReferencia(e.target.value)}
                    placeholder="Ponto de referência (opcional)"
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue"
                  />
                </div>

                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações do pedido (opcional)"
                  rows={2}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue resize-none"
                />

                {erro && (
                  <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="bg-sv-blue hover:bg-sv-red text-white font-black py-4 rounded-xl uppercase tracking-wider text-sm transition-colors duration-150 disabled:opacity-60"
                >
                  {enviando ? 'Enviando...' : `Finalizar Pedido — ${formatarBRL(total)}`}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5 flex flex-col gap-4 lg:sticky lg:top-28">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Resumo</p>

              {cupomAplicado ? (
                <div className={`flex flex-col gap-1 px-4 py-3 rounded-xl border-2 border-dashed ${avisoCupomInvalido ? 'border-amber-300 bg-amber-50' : 'border-green-400 bg-green-50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-black uppercase tracking-widest ${avisoCupomInvalido ? 'text-amber-700' : 'text-green-700'}`}>
                      {avisoCupomInvalido ? '⚠' : '✓'} {cupomAplicado.codigo}
                    </span>
                    <button type="button" onClick={removerCupom} className={`text-[10px] font-black uppercase ${avisoCupomInvalido ? 'text-amber-700' : 'text-green-700'} hover:text-sv-red`}>
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

              <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-sv-dark">{formatarBRL(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Entrega</span>
                  <span className="font-bold text-sv-dark">{bairroId ? formatarBRL(taxaEntrega) : 'Selecione o bairro'}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700 font-medium">Desconto</span>
                    <span className="font-bold text-green-700">-{formatarBRL(desconto)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-sv-dark">{formatarBRL(total)}</span>
                </div>
              </div>

              <p className="text-gray-400 text-[11px] font-medium">
                Pagamento via Pix — o código aparece assim que o pedido for enviado.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ConfirmacaoPedido({ pedido }) {
  const [copiado, setCopiado] = useState(false);
  const chavePix = process.env.NEXT_PUBLIC_PIX_CHAVE;

  const codigoPix = chavePix
    ? gerarPixCopiaECola({
        chave: chavePix,
        nome: process.env.NEXT_PUBLIC_PIX_NOME || 'The Seventies Burger',
        cidade: process.env.NEXT_PUBLIC_PIX_CIDADE || 'Sao Lourenco',
        valor: pedido.total,
        txid: `PEDIDO${pedido.numero}`,
      })
    : null;

  function copiar() {
    navigator.clipboard.writeText(codigoPix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col items-center gap-4">
        <span className="text-5xl">✅</span>
        <h1 className="text-2xl font-black text-sv-dark uppercase tracking-tight">Pedido enviado!</h1>
        <p className="text-gray-500 text-sm font-medium">
          Pedido <span className="font-black text-sv-dark">#{pedido.numero}</span> recebido — total de{' '}
          <span className="font-black text-sv-dark">{formatarBRL(pedido.total)}</span>.
        </p>

        {codigoPix ? (
          <div className="w-full flex flex-col gap-2 mt-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pague com Pix Copia e Cola</p>
            <button
              type="button"
              onClick={copiar}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-200 font-black text-xs uppercase tracking-widest ${
                copiado ? 'border-green-400 bg-green-50 text-green-600' : 'border-sv-blue text-sv-blue hover:bg-sv-blue hover:text-white'
              }`}
            >
              <span>{copiado ? '✓ Código copiado!' : 'Copiar código Pix'}</span>
            </button>
            <p className="text-gray-400 text-[11px] font-medium">
              Cole no app do seu banco pra pagar. Assim que o pagamento cair, seu pedido é confirmado.
            </p>
          </div>
        ) : (
          <p className="text-amber-600 text-xs font-bold bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Chave Pix não configurada — fale com a gente pelo WhatsApp pra combinar o pagamento.
          </p>
        )}

        <div className="flex gap-3 w-full mt-2">
          <a
            href="https://wa.me/5535992776777"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
          >
            Falar no WhatsApp
          </a>
          <Link
            href="/cardapio"
            className="flex-1 bg-sv-dark hover:bg-sv-blue text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150 flex items-center justify-center"
          >
            Ver Cardápio
          </Link>
        </div>
      </div>
    </section>
  );
}
