'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SeletorProdutos from '@/components/comanda/SeletorProdutos';
import CarrinhoComanda from '@/components/comanda/CarrinhoComanda';
import FecharContaModal from '@/components/comanda/FecharContaModal';
import BadgeStatus from '@/components/comanda/BadgeStatus';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { criarPedido } from '@/lib/comanda/pedidos';
import { abrirComanda, buscarComandaAbertaPorMesa, fecharComanda } from '@/lib/comanda/comandas';
import { PONTO_CARNE_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, tempoDecorrido } from '@/lib/comanda/formato';

export default function PainelMesa({ mesa, comandaInicial, produtos, categorias, adicionais }) {
  const router = useRouter();
  const [supabase] = useState(() => criarClienteBrowser());
  const [comanda, setComanda] = useState(comandaInicial);
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [erro, setErro] = useState(null);

  async function atualizarComanda() {
    const atual = await buscarComandaAbertaPorMesa(supabase, mesa.numero);
    setComanda(atual);
  }

  useEffect(() => {
    if (!comanda) return;
    let canal;
    let ativo = true;

    async function conectar() {
      await supabase.auth.getSession();
      if (!ativo) return;

      canal = supabase
        .channel(`mesa-${mesa.numero}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'comandas', filter: `id=eq.${comanda.id}` },
          async (payload) => {
            if (payload.eventType === 'DELETE' || payload.new?.status === 'fechada') {
              router.push('/comanda/mesas');
              return;
            }
            atualizarComanda();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos', filter: `comanda_id=eq.${comanda.id}` },
          () => atualizarComanda()
        )
        .subscribe();
    }

    conectar();
    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, comanda?.id, mesa.numero]);

  function adicionarProduto(produto, adicionaisSelecionados = []) {
    setItens((atual) => {
      const existente =
        adicionaisSelecionados.length === 0
          ? atual.find(
              (i) =>
                i.produtoId === produto.id &&
                !i.observacao &&
                !i.pontoCarne &&
                i.adicionaisSelecionados.length === 0
            )
          : null;

      if (existente) {
        return atual.map((i) => (i === existente ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [
        ...atual,
        {
          produtoId: produto.id,
          nome: produto.nome,
          precoUnitario: Number(produto.preco),
          quantidade: 1,
          observacao: '',
          pontoCarne: '',
          adicionaisSelecionados,
        },
      ];
    });
  }

  function atualizarQuantidade(idx, quantidade) {
    setItens((atual) => atual.map((item, i) => (i === idx ? { ...item, quantidade } : item)));
  }

  function atualizarObservacao(idx, observacao) {
    setItens((atual) => atual.map((item, i) => (i === idx ? { ...item, observacao } : item)));
  }

  function atualizarPontoCarne(idx, pontoCarne) {
    setItens((atual) => atual.map((item, i) => (i === idx ? { ...item, pontoCarne } : item)));
  }

  function atualizarAdicionaisItem(idx, adicionaisSelecionados) {
    setItens((atual) => atual.map((item, i) => (i === idx ? { ...item, adicionaisSelecionados } : item)));
  }

  function removerItem(idx) {
    setItens((atual) => atual.filter((_, i) => i !== idx));
  }

  async function abrirMesa() {
    setAbrindo(true);
    setErro(null);
    try {
      await abrirComanda(supabase, mesa.numero);
      await atualizarComanda();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível abrir a mesa. Tente de novo.');
    } finally {
      setAbrindo(false);
    }
  }

  async function enviarRodada(e) {
    e.preventDefault();
    if (itens.length === 0) {
      setErro('Adicione pelo menos um item.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await criarPedido(supabase, {
        tipo: 'mesa',
        comandaId: comanda.id,
        observacoes: observacoes || null,
        itens,
      });
      setItens([]);
      setObservacoes('');
      await atualizarComanda();
      router.refresh();
    } catch (err) {
      console.error(err);
      setErro(err?.message || 'Não foi possível enviar os itens. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarFechamento(comandaId, payload) {
    await fecharComanda(supabase, comandaId, payload);
    router.push('/comanda/mesas');
  }

  if (!comanda) {
    return (
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10 flex flex-col items-center gap-4 text-center">
        <p className="text-gray-400 font-medium">Essa mesa está livre no momento.</p>
        {erro && <p className="text-sv-red text-xs font-bold">{erro}</p>}
        <button
          type="button"
          onClick={abrirMesa}
          disabled={abrindo}
          className="bg-sv-blue text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-red transition-colors duration-150 disabled:opacity-60"
        >
          {abrindo ? 'Abrindo...' : 'Abrir mesa'}
        </button>
      </div>
    );
  }

  const rodadas = [...(comanda.pedidos ?? [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Conta aberta há {tempoDecorrido(comanda.aberta_em)}</p>
          <p className="text-3xl font-black text-sv-dark">{formatarBRL(comanda.total)}</p>
        </div>
        <button
          type="button"
          onClick={() => setContaAberta(true)}
          className="bg-sv-dark text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-sv-blue transition-colors duration-150"
        >
          Fechar comanda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Itens já pedidos</h2>
          {rodadas.length === 0 && (
            <p className="text-gray-400 text-sm font-medium py-6 text-center bg-white rounded-2xl border border-gray-100">
              Nenhum item lançado ainda.
            </p>
          )}
          {rodadas.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Pedido #{pedido.numero}</span>
                <BadgeStatus status={pedido.status} />
              </div>
              <ul className="flex flex-col gap-1.5">
                {(pedido.itens_pedido ?? []).map((item) => (
                  <li key={item.id} className="text-xs">
                    <span className="font-black text-sv-dark">{item.quantidade}x</span>{' '}
                    <span className="text-sv-dark font-medium">{item.nome_produto}</span>
                    {item.ponto_carne && (
                      <span className="block text-sv-red font-black pl-4 uppercase tracking-wide">
                        🔥 {PONTO_CARNE_LABEL[item.ponto_carne] ?? item.ponto_carne}
                      </span>
                    )}
                    {(item.itens_pedido_adicionais ?? []).map((adicional) => (
                      <span key={adicional.id} className="block text-sv-blue font-bold pl-4">
                        + {adicional.nome_adicional}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 mt-4">Adicionar itens</h2>
          <SeletorProdutos produtos={produtos} categorias={categorias} onAdicionar={adicionarProduto} />
        </div>

        <form onSubmit={enviarRodada} className="flex flex-col gap-4 min-w-0">
          <CarrinhoComanda
            supabase={supabase}
            itens={itens}
            tipoPedido="mesa"
            adicionaisDisponiveis={adicionais}
            onQuantidade={atualizarQuantidade}
            onObservacao={atualizarObservacao}
            onPontoCarne={atualizarPontoCarne}
            onAdicionais={atualizarAdicionaisItem}
            onRemover={removerItem}
          />

          <textarea
            placeholder="Observações desta rodada (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue transition-colors duration-150 resize-none"
          />

          {erro && (
            <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="bg-sv-blue text-white font-black py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:bg-sv-red disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {enviando ? 'Enviando...' : 'Enviar pra cozinha'}
          </button>
        </form>
      </div>

      {contaAberta && (
        <FecharContaModal
          comanda={comanda}
          onFechar={() => setContaAberta(false)}
          onConfirmar={confirmarFechamento}
        />
      )}
    </div>
  );
}
