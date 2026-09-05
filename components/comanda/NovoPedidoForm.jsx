'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SeletorProdutos from '@/components/comanda/SeletorProdutos';
import CarrinhoComanda from '@/components/comanda/CarrinhoComanda';
import CamposPedido from '@/components/comanda/CamposPedido';
import SeletorCliente from '@/components/comanda/SeletorCliente';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { criarPedido } from '@/lib/comanda/pedidos';

const CAMPOS_INICIAIS = {
  delivery: {
    clienteNome: '',
    clienteTelefone: '',
    endereco: '',
    pontoReferencia: '',
    bairroId: null,
    cidade: '',
    estado: '',
    taxaEntrega: 0,
  },
  pdv: { clienteNome: '', formaPagamento: null },
};

export default function NovoPedidoForm({ tipo, produtos, adicionais, categorias, bairros }) {
  const router = useRouter();
  const [supabase] = useState(() => criarClienteBrowser());
  const [itens, setItens] = useState([]);
  const [campos, setCampos] = useState(CAMPOS_INICIAIS[tipo]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [cupomCodigo, setCupomCodigo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  function adicionarProduto(produto, adicionaisSelecionados = []) {
    setSucesso(null);
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
          pontoCarne: '',
          adicionaisSelecionados,
          categoriasAdicionaisPermitidas: (produto.produto_categorias_adicionais ?? []).map(
            (v) => v.categoria_adicional_id
          ),
          temPontoCarne: produto.tem_ponto_carne ?? true,
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

  function selecionarCliente(cliente) {
    setClienteSelecionado(cliente);
    setCampos((atual) => ({
      ...atual,
      clienteNome: atual.clienteNome || cliente.nome,
      clienteTelefone: atual.clienteTelefone || cliente.telefone || '',
      endereco: atual.endereco || cliente.endereco || '',
      pontoReferencia: atual.pontoReferencia || cliente.ponto_referencia || '',
      bairroId: atual.bairroId || cliente.bairro_id || null,
      cidade: atual.cidade || cliente.cidade || '',
      estado: atual.estado || cliente.estado || '',
      taxaEntrega: atual.taxaEntrega || Number(cliente.bairros?.valor_entrega) || atual.taxaEntrega,
    }));
  }

  function validar() {
    if (itens.length === 0) return 'Adicione pelo menos um item ao pedido.';
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
        clienteId: clienteSelecionado?.id || null,
        clienteNome: campos.clienteNome || null,
        clienteTelefone: campos.clienteTelefone || null,
        endereco: campos.endereco || null,
        pontoReferencia: tipo === 'delivery' ? campos.pontoReferencia || null : null,
        bairroId: tipo === 'delivery' ? campos.bairroId || null : null,
        cidade: tipo === 'delivery' ? campos.cidade || null : null,
        estado: tipo === 'delivery' ? campos.estado || null : null,
        taxaEntrega: tipo === 'delivery' ? Number(campos.taxaEntrega) || 0 : 0,
        formaPagamento: campos.formaPagamento || null,
        observacoes: observacoes || null,
        cupomCodigo,
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
      setClienteSelecionado(null);
      setObservacoes('');
      setCupomCodigo(null);
      router.refresh();
    } catch (err) {
      setErro(err?.message || 'Não foi possível enviar o pedido. Tente novamente.');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviarPedido} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="flex flex-col gap-6 min-w-0">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-5 min-w-0">
          <SeletorCliente
            supabase={supabase}
            clienteSelecionado={clienteSelecionado}
            onSelecionar={selecionarCliente}
            onLimpar={() => setClienteSelecionado(null)}
            bairros={bairros}
          />
          <CamposPedido tipo={tipo} campos={campos} onChange={setCampos} bairros={bairros} />
        </div>

        <SeletorProdutos produtos={produtos} categorias={categorias} onAdicionar={adicionarProduto} />
      </div>

      <div className="flex flex-col gap-4 min-w-0">
        <CarrinhoComanda
          key={sucesso ?? 'novo'}
          supabase={supabase}
          itens={itens}
          tipoPedido={tipo}
          adicionaisDisponiveis={adicionais}
          taxaEntrega={tipo === 'delivery' ? Number(campos.taxaEntrega) || 0 : 0}
          onQuantidade={atualizarQuantidade}
          onObservacao={atualizarObservacao}
          onPontoCarne={atualizarPontoCarne}
          onAdicionais={atualizarAdicionaisItem}
          onRemover={removerItem}
          onCupomAplicado={setCupomCodigo}
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
