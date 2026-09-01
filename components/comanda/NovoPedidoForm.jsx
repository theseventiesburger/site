'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SeletorProdutos from '@/components/comanda/SeletorProdutos';
import CarrinhoComanda from '@/components/comanda/CarrinhoComanda';
import CamposPedido from '@/components/comanda/CamposPedido';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { criarPedido } from '@/lib/comanda/pedidos';

const CAMPOS_INICIAIS = {
  mesa: { mesa: null },
  delivery: { clienteNome: '', clienteTelefone: '', endereco: '', taxaEntrega: 0 },
  pdv: { clienteNome: '', formaPagamento: null },
};

export default function NovoPedidoForm({ tipo, produtos, mesas, adicionais }) {
  const router = useRouter();
  const [supabase] = useState(() => criarClienteBrowser());
  const [itens, setItens] = useState([]);
  const [campos, setCampos] = useState(CAMPOS_INICIAIS[tipo]);
  const [observacoes, setObservacoes] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  function adicionarProduto(produto) {
    setSucesso(null);
    setItens((atual) => {
      const existente = atual.find(
        (i) => i.produtoId === produto.id && !i.observacao && i.adicionaisSelecionados.length === 0
      );
      if (existente) {
        return atual.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [
        ...atual,
        {
          produtoId: produto.id,
          nome: produto.nome,
          precoUnitario: Number(produto.preco),
          quantidade: 1,
          observacao: '',
          adicionaisSelecionados: [],
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

  function atualizarAdicionaisItem(idx, adicionaisSelecionados) {
    setItens((atual) => atual.map((item, i) => (i === idx ? { ...item, adicionaisSelecionados } : item)));
  }

  function removerItem(idx) {
    setItens((atual) => atual.filter((_, i) => i !== idx));
  }

  function validar() {
    if (itens.length === 0) return 'Adicione pelo menos um item ao pedido.';
    if (tipo === 'mesa' && !campos.mesa) return 'Selecione a mesa.';
    if (tipo === 'delivery' && (!campos.clienteNome || !campos.endereco)) {
      return 'Nome do cliente e endereço são obrigatórios no delivery.';
    }
    return null;
  }

  async function enviarPedido(e) {
    e.preventDefault();
    const mensagemErro = validar();
    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const pedidoId = await criarPedido(supabase, {
        tipo,
        mesa: tipo === 'mesa' ? campos.mesa : null,
        clienteNome: campos.clienteNome || null,
        clienteTelefone: campos.clienteTelefone || null,
        endereco: campos.endereco || null,
        taxaEntrega: tipo === 'delivery' ? Number(campos.taxaEntrega) || 0 : 0,
        formaPagamento: campos.formaPagamento || null,
        observacoes: observacoes || null,
        itens,
      });

      const { data: pedidoCriado } = await supabase
        .from('pedidos')
        .select('numero')
        .eq('id', pedidoId)
        .single();

      setSucesso(pedidoCriado?.numero ?? null);
      setItens([]);
      setCampos(CAMPOS_INICIAIS[tipo]);
      setObservacoes('');
      router.refresh();
    } catch (err) {
      setErro('Não foi possível enviar o pedido. Tente novamente.');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviarPedido} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
          <CamposPedido tipo={tipo} campos={campos} onChange={setCampos} mesas={mesas} />
        </div>

        <SeletorProdutos produtos={produtos} onAdicionar={adicionarProduto} />
      </div>

      <div className="flex flex-col gap-4">
        <CarrinhoComanda
          itens={itens}
          adicionaisDisponiveis={adicionais}
          taxaEntrega={tipo === 'delivery' ? Number(campos.taxaEntrega) || 0 : 0}
          onQuantidade={atualizarQuantidade}
          onObservacao={atualizarObservacao}
          onAdicionais={atualizarAdicionaisItem}
          onRemover={removerItem}
        />

        <textarea
          placeholder="Observações do pedido (opcional)"
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

        {sucesso !== null && (
          <p className="text-green-700 text-xs font-bold bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            Pedido #{sucesso} enviado para a cozinha! 🎉
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="bg-sv-blue text-white font-black py-4 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 hover:bg-sv-red disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
        >
          {enviando ? 'Enviando...' : 'Enviar para a cozinha'}
        </button>
      </div>
    </form>
  );
}
