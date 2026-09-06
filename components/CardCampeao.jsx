'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatarBRL } from '@/lib/comanda/formato';
import { useCarrinho } from '@/components/site/CarrinhoContext';

const ROTULOS_PADRAO = ['Mais Pedido 🔥', 'Favorito da Casa 👑', 'Preferido dos Clientes ⭐'];

export default function CardCampeao({ item, indice }) {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);

  const produto = {
    id: item.produto_id,
    slug: item.slug,
    nome: item.nome,
    imagem: item.imagem,
    preco: item.preco,
    preco_promocional: item.preco_promocional,
  };
  // Não usa item.tag aqui — na prática esse campo guarda "Número X" (a
  // numeração do lanche no cardápio), não uma frase de destaque de vendas.
  const rotulo = ROTULOS_PADRAO[indice] || 'Destaque do Cardápio ⭐';

  function clicar() {
    adicionar(produto);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group relative text-left min-h-[500px]">
      <div className="relative w-full flex flex-col items-center">
        <span className="absolute top-0 right-0 bg-sv-dark text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10">
          {rotulo}
        </span>

        <div className="w-full h-48 relative mt-6 transform transition-transform duration-500 group-hover:scale-110">
          <Image
            src={produto.imagem}
            alt={produto.nome}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]"
            priority
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col flex-grow">
        <h4 className="text-2xl font-black text-sv-dark tracking-tight uppercase group-hover:text-sv-blue transition-colors duration-200">
          {produto.nome}
        </h4>
        <p className="text-gray-500 font-medium text-sm mt-3 leading-relaxed flex-grow">
          {item.descricao}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preço</span>
          {produto.preco_promocional ? (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-gray-400 line-through">{formatarBRL(produto.preco)}</span>
              <span className="text-2xl font-black text-sv-red">{formatarBRL(produto.preco_promocional)}</span>
            </div>
          ) : (
            <span className="text-2xl font-black text-sv-dark">{formatarBRL(produto.preco)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={clicar}
          className={`font-black px-6 py-3 rounded-xl shadow-md transition-all duration-200 tracking-wide uppercase text-xs ${
            adicionado ? 'bg-green-500 text-white' : 'bg-sv-blue text-white hover:bg-sv-red hover:scale-105'
          }`}
        >
          {adicionado ? '✓ Adicionado' : 'Eu quero'}
        </button>
      </div>
    </div>
  );
}
