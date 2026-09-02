'use client';

import { useEffect, useState } from 'react';
import { buscarClientes, criarCliente } from '@/lib/comanda/clientes';

// Evita que Enter num campo aqui dentro submeta o pedido inteiro — este
// seletor vive dentro do <form> de Novo Pedido.
function bloquearEnter(e) {
  if (e.key === 'Enter') e.preventDefault();
}

export default function SeletorCliente({ supabase, clienteSelecionado, onSelecionar, onLimpar }) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');
  const [novoNascimento, setNovoNascimento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Abaixo de 2 caracteres o dropdown nem renderiza (ver JSX), então só
    // pula a busca — sem precisar zerar resultados aqui.
    if (termo.trim().length < 2) return;

    let ativo = true;
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const dados = await buscarClientes(supabase, termo);
        if (ativo) setResultados(dados);
      } catch (err) {
        console.error(err);
      } finally {
        if (ativo) setBuscando(false);
      }
    }, 300);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [termo, supabase]);

  function selecionar(cliente) {
    onSelecionar(cliente);
    setTermo('');
    setResultados([]);
  }

  async function salvarNovoCliente() {
    if (!novoNome) {
      setErro('Preencha o nome.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const cliente = await criarCliente(supabase, {
        nome: novoNome,
        telefone: novoTelefone,
        endereco: novoEndereco,
        dataNascimento: novoNascimento,
      });
      selecionar(cliente);
      setMostrarForm(false);
      setNovoNome('');
      setNovoTelefone('');
      setNovoEndereco('');
      setNovoNascimento('');
    } catch (err) {
      console.error(err);
      setErro('Não foi possível cadastrar o cliente.');
    } finally {
      setSalvando(false);
    }
  }

  if (clienteSelecionado) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Cliente</label>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-sv-blue/30 bg-sv-blue/5">
          <span className="font-bold text-sv-dark text-sm flex-1 truncate">{clienteSelecionado.nome}</span>
          <button type="button" onClick={onLimpar} className="text-xs font-black uppercase text-sv-red">
            Trocar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Cliente (opcional)</label>
      <div className="relative">
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={bloquearEnter}
          placeholder="Buscar por nome ou telefone..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-sv-blue transition-colors duration-150"
        />
        {termo.trim().length >= 2 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-56 overflow-y-auto">
            {buscando && <p className="px-4 py-3 text-xs text-gray-400 font-medium">Buscando...</p>}
            {!buscando && resultados.length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-400 font-medium">Nenhum cliente encontrado.</p>
            )}
            {resultados.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => selecionar(cliente)}
                className="w-full text-left px-4 py-3 hover:bg-[#F7F7F7] transition-colors duration-150 border-b border-gray-50 last:border-0"
              >
                <p className="font-bold text-sv-dark text-sm truncate">{cliente.nome}</p>
                {cliente.telefone && <p className="text-gray-400 text-xs font-medium">{cliente.telefone}</p>}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setMostrarForm((v) => !v)}
        className="self-start text-[11px] font-black uppercase tracking-wider text-sv-blue hover:text-sv-red transition-colors duration-150"
      >
        {mostrarForm ? 'Cancelar' : '+ Cadastrar novo cliente'}
      </button>

      {mostrarForm && (
        <div className="flex flex-col gap-2 p-4 bg-[#F7F7F7] rounded-xl border border-gray-100">
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={bloquearEnter}
            placeholder="Nome *"
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={novoTelefone}
              onChange={(e) => setNovoTelefone(e.target.value)}
              onKeyDown={bloquearEnter}
              placeholder="Telefone"
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
            />
            <input
              type="date"
              value={novoNascimento}
              onChange={(e) => setNovoNascimento(e.target.value)}
              onKeyDown={bloquearEnter}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
            />
          </div>
          <input
            value={novoEndereco}
            onChange={(e) => setNovoEndereco(e.target.value)}
            onKeyDown={bloquearEnter}
            placeholder="Endereço"
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
          />
          {erro && <p className="text-sv-red text-xs font-bold">{erro}</p>}
          <button
            type="button"
            onClick={salvarNovoCliente}
            disabled={salvando}
            className="bg-sv-blue hover:bg-sv-red text-white font-black py-2.5 rounded-lg uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </div>
      )}
    </div>
  );
}
