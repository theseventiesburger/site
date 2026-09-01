'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatarBRL } from '@/lib/comanda/formato';
import {
  listarTodosAdicionais,
  listarAdicionaisDoProduto,
  vincularAdicionalProduto,
  desvincularAdicionalProduto,
} from '@/lib/comanda/adicionais';

export default function SeletorAdicionaisProduto({ supabase, produtoId }) {
  const [todos, setTodos] = useState([]);
  const [vinculados, setVinculados] = useState(new Set());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [todosAdicionais, vinculadosSet] = await Promise.all([
        listarTodosAdicionais(supabase),
        listarAdicionaisDoProduto(supabase, produtoId),
      ]);
      if (!ativo) return;
      setTodos(todosAdicionais);
      setVinculados(vinculadosSet);
      setCarregando(false);
    }

    carregar();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtoId]);

  async function toggle(adicional) {
    const estaVinculado = vinculados.has(adicional.id);

    setVinculados((atual) => {
      const novo = new Set(atual);
      if (estaVinculado) novo.delete(adicional.id);
      else novo.add(adicional.id);
      return novo;
    });

    try {
      if (estaVinculado) {
        await desvincularAdicionalProduto(supabase, produtoId, adicional.id);
      } else {
        await vincularAdicionalProduto(supabase, produtoId, adicional.id);
      }
    } catch (err) {
      console.error(err);
      setVinculados((atual) => {
        const novo = new Set(atual);
        if (estaVinculado) novo.add(adicional.id);
        else novo.delete(adicional.id);
        return novo;
      });
    }
  }

  const ativos = todos.filter((a) => a.ativo);

  return (
    <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Adicionais</p>
        <Link href="/comanda/adicionais" className="text-[10px] font-black uppercase text-sv-blue hover:text-sv-red">
          Gerenciar catálogo
        </Link>
      </div>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando...</p>
      ) : ativos.length === 0 ? (
        <p className="text-xs text-gray-400">
          Nenhum adicional cadastrado ainda —{' '}
          <Link href="/comanda/adicionais" className="text-sv-blue underline">
            cadastre no catálogo
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {ativos.map((adicional) => (
            <label
              key={adicional.id}
              className="flex items-center gap-2 text-xs font-medium text-sv-dark p-2 rounded-lg bg-[#F7F7F7] border border-gray-100"
            >
              <input type="checkbox" checked={vinculados.has(adicional.id)} onChange={() => toggle(adicional)} />
              <span className="truncate flex-1">{adicional.nome}</span>
              <span className="text-gray-400 flex-shrink-0">{formatarBRL(adicional.preco)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
