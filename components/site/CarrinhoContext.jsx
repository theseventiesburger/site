'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CarrinhoContext = createContext(null);
const CHAVE_STORAGE = 'sv-carrinho';

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [carregado, setCarregado] = useState(false);

  // Carrega do localStorage só depois de montar — evita divergência entre
  // o HTML gerado no servidor (sem acesso a localStorage) e o do cliente.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // localStorage indisponível (aba privada etc.) — carrinho só não persiste.
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {
      // idem
    }
  }, [itens, carregado]);

  // tamanho: linha de produto_tamanhos ({ id, nome, preco }) quando o
  // produto tem tamanho, ou null pra vender pelo preço base normal — cada
  // tamanho vira uma linha própria no carrinho (fritas P e fritas G não se
  // somam na mesma linha).
  function adicionar(produto, tamanho = null) {
    const chave = tamanho ? `${produto.id}:${tamanho.id}` : produto.id;
    setItens((atual) => {
      const existente = atual.find((i) => i.chave === chave);
      if (existente) {
        return atual.map((i) => (i.chave === chave ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [
        ...atual,
        {
          chave,
          produtoId: produto.id,
          tamanhoId: tamanho?.id ?? null,
          slug: produto.slug,
          nome: tamanho ? `${produto.nome} (${tamanho.nome})` : produto.nome,
          imagem: produto.imagem,
          preco: tamanho ? Number(tamanho.preco) : Number(produto.preco_promocional || produto.preco),
          quantidade: 1,
        },
      ];
    });
  }

  function alterarQuantidade(chave, delta) {
    setItens((atual) =>
      atual
        .map((i) => (i.chave === chave ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0)
    );
  }

  function remover(chave) {
    setItens((atual) => atual.filter((i) => i.chave !== chave));
  }

  function limpar() {
    setItens([]);
  }

  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);
  const subtotal = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionar, alterarQuantidade, remover, limpar, totalItens, subtotal }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) throw new Error('useCarrinho precisa estar dentro de um CarrinhoProvider.');
  return contexto;
}
