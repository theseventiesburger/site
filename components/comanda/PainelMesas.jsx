'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { abrirComanda } from '@/lib/comanda/comandas';
import { formatarBRL, tempoDecorrido } from '@/lib/comanda/formato';

export default function PainelMesas({ mesasIniciais }) {
  const router = useRouter();
  const [supabase] = useState(() => criarClienteBrowser());
  const [mesas, setMesas] = useState(mesasIniciais);
  const [conectado, setConectado] = useState(false);
  const [abrindo, setAbrindo] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let canal;
    let ativo = true;

    async function conectar() {
      // Necessário aguardar a sessão antes de abrir o canal, senão o RLS
      // descarta os primeiros eventos por a sessão ainda não estar anexada.
      await supabase.auth.getSession();
      if (!ativo) return;

      canal = supabase
        .channel('mesas-comandas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comandas' }, (payload) => {
          const mesaId = payload.new?.mesa_id ?? payload.old?.mesa_id;
          const fechouOuSumiu = payload.eventType === 'DELETE' || payload.new?.status === 'fechada';
          setMesas((atual) =>
            atual.map((mesa) =>
              mesa.numero === mesaId ? { ...mesa, comanda: fechouOuSumiu ? null : payload.new } : mesa
            )
          );
        })
        .subscribe((status) => setConectado(status === 'SUBSCRIBED'));
    }

    conectar();

    return () => {
      ativo = false;
      if (canal) supabase.removeChannel(canal);
    };
  }, [supabase]);

  async function abrirMesa(mesa) {
    setAbrindo(mesa.numero);
    setErro(null);
    try {
      await abrirComanda(supabase, mesa.numero);
      router.push(`/comanda/mesas/${mesa.numero}`);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível abrir a mesa. Tente de novo.');
      setAbrindo(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-gray-300'}`} />
        {conectado ? 'Ao vivo' : 'Conectando...'}
      </div>

      {erro && (
        <p className="text-sv-red text-xs font-bold bg-sv-red/5 border border-sv-red/20 rounded-xl px-4 py-3">
          ⚠ {erro}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map((mesa) => {
          const ocupada = Boolean(mesa.comanda);
          return (
            <button
              key={mesa.numero}
              type="button"
              onClick={() => (ocupada ? router.push(`/comanda/mesas/${mesa.numero}`) : abrirMesa(mesa))}
              disabled={abrindo === mesa.numero}
              className={`aspect-square rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 font-black uppercase tracking-wider transition-all duration-150 disabled:opacity-60 ${
                ocupada
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {!ocupada && <span className="text-[10px]">Abrir</span>}
              <span className="text-2xl">{String(mesa.numero).padStart(2, '0')}</span>
              {mesa.apelido && (
                <span className="text-[10px] normal-case font-bold opacity-90 truncate max-w-[90%]">{mesa.apelido}</span>
              )}
              {ocupada && (
                <>
                  <span className="text-xs font-bold opacity-90">{formatarBRL(mesa.comanda.total)}</span>
                  <span className="text-[10px] font-medium opacity-75">há {tempoDecorrido(mesa.comanda.aberta_em)}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
