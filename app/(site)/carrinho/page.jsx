'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { useCarrinho } from '@/components/site/CarrinhoContext';
import { listarBairrosPublico, criarPedidoSite } from '@/lib/site/pedidos';
import { obterMeuCadastro } from '@/lib/site/clientes';
import { gerarPixCopiaECola } from '@/lib/site/pix';
import { formatarBRL } from '@/lib/comanda/formato';
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

  const [carregandoConta, setCarregandoConta] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [tipoEntrega, setTipoEntrega] = useState('entrega'); // 'entrega' | 'retirada'
  const [bairros, setBairros] = useState([]);
  const [bairroId, setBairroId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [erroCupom, setErroCupom] = useState(null);
  const [verificandoCupom, setVerificandoCupom] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [erroBairros, setErroBairros] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  // Trava síncrona contra clique duplo — o estado "enviando" só bloqueia o
  // botão depois de re-renderizar, e um clique/Enter bem rápido pode
  // disparar duas requisições antes disso, criando dois pedidos pagos.
  const enviandoRef = useRef(false);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);
      if (user) {
        try {
          const meuCadastro = await obterMeuCadastro(supabase);
          setCliente(meuCadastro);
          if (meuCadastro) {
            setEndereco(meuCadastro.endereco ?? '');
            setBairroId(meuCadastro.bairro_id ?? '');
            setPontoReferencia(meuCadastro.ponto_referencia ?? '');
          }
        } catch (err) {
          console.error(err);
        }
      }
      setCarregandoConta(false);
    }
    carregar();
    listarBairrosPublico(supabase)
      .then(setBairros)
      .catch((err) => {
        console.error(err);
        setErroBairros(true);
      });
  }, [supabase]);

  // Se o bairro salvo no cadastro tiver sido desativado depois, bairroId
  // aponta pra um id que não está mais na lista — trata como "nenhum
  // selecionado" em vez de deixar passar com frete zerado por engano.
  const bairro = bairros.find((b) => b.id === bairroId);
  const bairroSelecionadoValido = Boolean(bairroId) && bairros.length > 0 && Boolean(bairro);
  const taxaEntrega = tipoEntrega === 'retirada' ? 0 : Number(bairro?.valor_entrega ?? 0);

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
    if (enviandoRef.current) return;
    if (tipoEntrega === 'entrega' && !bairroSelecionadoValido) {
      setErro('Selecione seu bairro.');
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setErro(null);

    try {
      const resultado = await criarPedidoSite(supabase, {
        tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? endereco : null,
        bairroId: tipoEntrega === 'entrega' ? bairroId : null,
        pontoReferencia: tipoEntrega === 'entrega' ? pontoReferencia : null,
        observacoes,
        cupomCodigo: cupomValido?.codigo || null,
        itens: itens.map((i) => ({ produto_id: i.produtoId, quantidade: i.quantidade })),
      });
      setPedidoConfirmado(resultado);
      limpar();
    } catch (err) {
      console.error(err);
      setErro(err.message || 'Não foi possível enviar o pedido. Tente novamente.');
      enviandoRef.current = false;
    } finally {
      setEnviando(false);
    }
  }

  if (pedidoConfirmado) {
    return <ConfirmacaoPedido supabase={supabase} pedido={pedidoConfirmado} />;
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

              {carregandoConta ? (
                <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 text-center text-gray-400 text-sm font-medium">
                  Carregando...
                </div>
              ) : !usuario ? (
                <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center gap-3">
                  <span className="text-3xl">🔒</span>
                  <p className="font-black text-sv-dark uppercase tracking-tight">Entre pra finalizar seu pedido</p>
                  <p className="text-gray-500 text-sm font-medium">
                    Assim seu endereço fica salvo e você não precisa digitar tudo de novo da próxima vez.
                  </p>
                  <div className="flex gap-3 w-full mt-2">
                    <Link
                      href="/conta/entrar?proximo=/carrinho"
                      className="flex-1 bg-sv-dark hover:bg-sv-blue text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/conta/cadastro?proximo=/carrinho"
                      className="flex-1 bg-sv-blue hover:bg-sv-red text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs transition-colors duration-150"
                    >
                      Criar conta
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={finalizarPedido} className="bg-white rounded-3xl shadow-md border border-gray-100 p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoEntrega('entrega')}
                      className={`py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors duration-150 ${
                        tipoEntrega === 'entrega' ? 'bg-sv-blue text-white' : 'bg-[#F7F7F7] text-gray-400 hover:text-sv-dark'
                      }`}
                    >
                      🛵 Entrega
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoEntrega('retirada')}
                      className={`py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors duration-150 ${
                        tipoEntrega === 'retirada' ? 'bg-sv-blue text-white' : 'bg-[#F7F7F7] text-gray-400 hover:text-sv-dark'
                      }`}
                    >
                      🏠 Retirar no balcão
                    </button>
                  </div>

                  {tipoEntrega === 'entrega' ? (
                    <>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Entregar em</p>

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

                      {erroBairros && (
                        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
                          Não conseguimos carregar os bairros agora. Atualize a página ou peça pelo WhatsApp.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-3 bg-[#F7F7F7] rounded-xl px-4 py-3.5">
                      <span className="text-xl flex-shrink-0">📍</span>
                      <div>
                        <p className="font-black text-sv-dark text-sm uppercase tracking-tight">Retire no balcão</p>
                        <p className="text-gray-500 text-xs font-medium mt-0.5">
                          R. Wenceslau Braz, 167 — Centro, São Lourenço - MG
                        </p>
                      </div>
                    </div>
                  )}

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
              )}
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
                  <span className="text-gray-500 font-medium">{tipoEntrega === 'retirada' ? 'Retirada' : 'Entrega'}</span>
                  <span className="font-bold text-sv-dark">
                    {tipoEntrega === 'retirada' ? 'Grátis' : bairroSelecionadoValido ? formatarBRL(taxaEntrega) : 'Selecione o bairro'}
                  </span>
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

function ConfirmacaoPedido({ supabase, pedido }) {
  const [copiado, setCopiado] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [pago, setPago] = useState(pedido.pago);
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

  useEffect(() => {
    if (!codigoPix) return;
    QRCode.toDataURL(codigoPix, { width: 260, margin: 1 })
      .then(setQrCodeUrl)
      .catch((err) => console.error(err));
  }, [codigoPix]);

  // Acompanha o pagamento em tempo real — quando o atendente confirma no
  // painel, essa tela atualiza sozinha sem precisar recarregar.
  useEffect(() => {
    if (pago) return;
    const canal = supabase
      .channel(`pedido-${pedido.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedido.id}` },
        (payload) => {
          if (payload.new.pago) setPago(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase, pedido.id, pago]);

  function copiar() {
    navigator.clipboard.writeText(codigoPix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <section className="w-full bg-[#F7F7F7] min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col items-center gap-4">
        <span className="text-5xl">{pago ? '🎉' : '✅'}</span>
        <h1 className="text-2xl font-black text-sv-dark uppercase tracking-tight">
          {pago ? 'Pagamento confirmado!' : 'Pedido enviado!'}
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Pedido <span className="font-black text-sv-dark">#{pedido.numero}</span> — total de{' '}
          <span className="font-black text-sv-dark">{formatarBRL(pedido.total)}</span>.
        </p>

        {pago ? (
          <p className="w-full bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl px-4 py-4">
            Recebemos seu pagamento — seu pedido já está em preparo! 🍔
          </p>
        ) : codigoPix ? (
          <div className="w-full flex flex-col items-center gap-3 mt-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pague com Pix</p>

            {qrCodeUrl && (
              <div className="p-3 bg-white border border-gray-200 rounded-2xl">
                <Image src={qrCodeUrl} alt="QR Code Pix" width={220} height={220} unoptimized />
              </div>
            )}

            <button
              type="button"
              onClick={copiar}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-200 font-black text-xs uppercase tracking-widest ${
                copiado ? 'border-green-400 bg-green-50 text-green-600' : 'border-sv-blue text-sv-blue hover:bg-sv-blue hover:text-white'
              }`}
            >
              {copiado ? '✓ Código copiado!' : 'Copiar código Pix'}
            </button>
            <p className="text-gray-400 text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              Aguardando pagamento — essa tela atualiza sozinha assim que cair.
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
