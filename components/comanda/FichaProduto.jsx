import Image from 'next/image';
import { formatarBRL, formatarDataCurta } from '@/lib/comanda/formato';

const CATEGORIA_LABEL = {
  especiais: 'Especiais',
  classicos: 'Clássicos',
  combos: 'Combos',
  bebidas: 'Bebidas',
  sobremesas: 'Sobremesas',
};

// Agrupa a ficha técnica: "Padrão" (produto_tamanho_id nulo) primeiro,
// depois uma seção por tamanho que tiver ficha própria — só aparece a
// seção de um tamanho se ele realmente tiver alguma linha cadastrada
// (senão ele usa a Padrão na baixa de estoque, não precisa repetir aqui).
function agruparReceitaPorTamanho(receita, tamanhos) {
  const padrao = receita.filter((r) => !r.produto_tamanho_id);
  const porTamanho = tamanhos
    .map((tamanho) => ({
      tamanho,
      itens: receita.filter((r) => r.produto_tamanho_id === tamanho.id),
    }))
    .filter((grupo) => grupo.itens.length > 0);

  return { padrao, porTamanho };
}

function TabelaReceita({ receita }) {
  if (receita.length === 0) {
    return (
      <p className="text-gray-400 text-xs font-medium italic">
        Nenhum insumo vinculado no cadastro — sem ficha técnica registrada.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
          <th className="py-2 pr-3">Insumo</th>
          <th className="py-2 text-right">Consumo por unidade</th>
        </tr>
      </thead>
      <tbody>
        {receita.map((r) => (
          <tr key={r.id} className="border-b border-gray-100 last:border-0">
            <td className="py-2.5 pr-3 font-bold text-sv-dark">{r.insumos?.nome}</td>
            <td className="py-2.5 text-right text-gray-600 font-medium">{r.quantidade} {r.insumos?.unidade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function FichaProduto({ produto, receita = [] }) {
  const categoriaNome = produto.categorias?.nome ?? CATEGORIA_LABEL[produto.categoria] ?? null;
  const { padrao: receitaPadrao, porTamanho } = agruparReceitaPorTamanho(
    receita,
    produto.produto_tamanhos ?? []
  );

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white print:mx-0 print:max-w-none break-after-page">
      <div className="border-2 border-sv-dark rounded-[28px] print:rounded-none print:border-black overflow-hidden m-4 print:m-0 shadow-xl print:shadow-none">

        {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
        <div className="bg-sv-dark text-white px-8 py-6 flex items-center justify-between gap-4 print:bg-sv-dark">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 relative rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 bg-white">
              <Image src="/logo.png" alt="The Seventies Burger" fill className="object-contain" />
            </div>
            <div>
              <p className="font-black uppercase tracking-tighter text-lg leading-none">The Seventies Burger</p>
              <p className="text-sv-blue text-[10px] font-black uppercase tracking-[0.25em] mt-1">Ficha do Produto</p>
            </div>
          </div>
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest text-right flex-shrink-0">
            Emitido em<br />{formatarDataCurta(new Date().toISOString())}
          </p>
        </div>

        {/* ── Identificação ────────────────────────────────────────────── */}
        <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-48 h-48 relative rounded-2xl overflow-hidden bg-[#F7F7F7] border border-gray-100 flex-shrink-0">
            <Image src={produto.imagem} alt={produto.nome} fill className="object-contain" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-sv-dark uppercase tracking-tighter leading-none">
                {produto.nome}
              </h1>
              <span className="flex-shrink-0 bg-sv-dark text-white text-2xl font-black px-4 py-1.5 rounded-xl">
                {formatarBRL(produto.preco)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {categoriaNome && (
                <span className="bg-sv-blue/10 text-sv-blue text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {produto.categorias?.emoji ? `${produto.categorias.emoji} ` : ''}{categoriaNome}
                </span>
              )}
              {produto.tag && (
                <span className="bg-sv-red/10 text-sv-red text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {produto.tag}
                </span>
              )}
              {produto.preco_promocional && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Promo: {formatarBRL(produto.preco_promocional)}
                </span>
              )}
            </div>

            {produto.descricao && (
              <p className="text-gray-500 text-sm font-medium leading-relaxed">{produto.descricao}</p>
            )}
          </div>
        </div>

        {/* ── Divisor picotado ─────────────────────────────────────────── */}
        <div className="relative flex items-center px-8">
          <div className="absolute -left-3 w-6 h-6 bg-[#F7F7F7] print:hidden rounded-full border border-gray-100" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          <div className="absolute -right-3 w-6 h-6 bg-[#F7F7F7] print:hidden rounded-full border border-gray-100" />
        </div>

        {/* ── Ficha técnica ────────────────────────────────────────────── */}
        <div className="px-8 py-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              {porTamanho.length > 0 ? 'Ficha Técnica — Padrão' : 'Ficha Técnica'}
            </p>
            <TabelaReceita receita={receitaPadrao} />
          </div>

          {porTamanho.map(({ tamanho, itens }) => (
            <div key={tamanho.id}>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Ficha Técnica — {tamanho.nome}
              </p>
              <TabelaReceita receita={itens} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-8 pb-4">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <p className="text-gray-300 text-[9px] font-bold uppercase tracking-widest">
            Documento interno · The Seventies Burger Company
          </p>
        </div>
      </div>
    </div>
  );
}
