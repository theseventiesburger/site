'use client';

import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL } from '@/lib/comanda/constantes';
import { formatarBRL, formatarTelefone } from '@/lib/comanda/formato';

const campoClasse =
  'w-full px-4 py-3 rounded-xl border border-gray-200 text-sv-dark font-medium text-sm focus:outline-none focus:border-sv-blue transition-colors duration-150';
const labelClasse = 'text-xs font-black text-gray-400 uppercase tracking-widest';

export default function CamposPedido({ tipo, campos, onChange, mesas, bairros = [] }) {
  function set(chave, valor) {
    onChange({ ...campos, [chave]: valor });
  }

  // Trocar o bairro já preenche a taxa de entrega sugerida — ainda dá pra
  // sobrescrever o valor na mão depois.
  function selecionarBairro(bairroId) {
    const bairro = bairros.find((b) => b.id === bairroId);
    onChange({
      ...campos,
      bairroId: bairroId || null,
      taxaEntrega: bairro ? Number(bairro.valor_entrega) : campos.taxaEntrega,
    });
  }

  if (tipo === 'mesa') {
    return (
      <div className="flex flex-col gap-2">
        <label className={labelClasse} htmlFor="mesa">Mesa</label>
        <select
          id="mesa"
          className={campoClasse}
          value={campos.mesa ?? ''}
          onChange={(e) => set('mesa', e.target.value ? Number(e.target.value) : null)}
          required
        >
          <option value="" disabled>Selecione a mesa</option>
          {mesas.map((m) => (
            <option key={m.numero} value={m.numero}>
              Mesa {m.numero}{m.apelido ? ` — ${m.apelido}` : ''}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (tipo === 'delivery') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className={labelClasse} htmlFor="clienteNome">Nome do cliente</label>
          <input
            id="clienteNome"
            className={campoClasse}
            value={campos.clienteNome ?? ''}
            onChange={(e) => set('clienteNome', e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClasse} htmlFor="clienteTelefone">Telefone</label>
          <input
            id="clienteTelefone"
            className={campoClasse}
            value={campos.clienteTelefone ?? ''}
            onChange={(e) => set('clienteTelefone', formatarTelefone(e.target.value))}
            placeholder="(35) 99277-6777"
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className={labelClasse} htmlFor="endereco">Endereço (rua e número)</label>
          <input
            id="endereco"
            className={campoClasse}
            value={campos.endereco ?? ''}
            onChange={(e) => set('endereco', e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClasse} htmlFor="bairro">Bairro</label>
          <select
            id="bairro"
            className={campoClasse}
            value={campos.bairroId ?? ''}
            onChange={(e) => selecionarBairro(e.target.value)}
          >
            <option value="">Selecione</option>
            {bairros.map((b) => (
              <option key={b.id} value={b.id}>{b.nome} — {formatarBRL(b.valor_entrega)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClasse} htmlFor="cidade">Cidade</label>
          <input
            id="cidade"
            className={campoClasse}
            value={campos.cidade ?? ''}
            onChange={(e) => set('cidade', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClasse} htmlFor="estado">UF</label>
          <input
            id="estado"
            className={`${campoClasse} uppercase`}
            value={campos.estado ?? ''}
            onChange={(e) => set('estado', e.target.value.toUpperCase())}
            maxLength={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClasse} htmlFor="taxaEntrega">Taxa de entrega (R$)</label>
          <input
            id="taxaEntrega"
            type="number"
            min="0"
            step="0.01"
            className={campoClasse}
            value={campos.taxaEntrega ?? 0}
            onChange={(e) => set('taxaEntrega', Number(e.target.value))}
          />
        </div>
      </div>
    );
  }

  // pdv
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label className={labelClasse} htmlFor="clienteNome">Nome do cliente (opcional)</label>
        <input
          id="clienteNome"
          className={campoClasse}
          value={campos.clienteNome ?? ''}
          onChange={(e) => set('clienteNome', e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelClasse} htmlFor="formaPagamento">Forma de pagamento</label>
        <select
          id="formaPagamento"
          className={campoClasse}
          value={campos.formaPagamento ?? ''}
          onChange={(e) => set('formaPagamento', e.target.value || null)}
        >
          <option value="">Selecione</option>
          {FORMAS_PAGAMENTO.map((f) => (
            <option key={f} value={f}>{FORMA_PAGAMENTO_LABEL[f]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
