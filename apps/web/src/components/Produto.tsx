import Link from 'next/link';
import { Icon } from './Icon';
import { foto, type Produto } from '@/lib/site';

/** Preço do produto: original riscado + selo (se houver), preço atual e parcelas. */
export function PrecoProduto({ p, size = 28 }: { p: Produto; size?: number }) {
  return (
    <span className="flex flex-col gap-1.5">
      {p.precoOriginal && (
        <span className="flex items-center gap-2">
          <s className="was num"><span className="sr">Preço anterior: </span>{p.precoOriginal}</s>
          {p.desconto && <span className="tag tag-off">{p.desconto}</span>}
        </span>
      )}
      <span className="price num" style={{ fontSize: size }}>{p.preco}</span>
      {p.parcelas && <span className="text-[13px] text-muted">{p.parcelas}</span>}
    </span>
  );
}

const ICONE = { presencial: 'map-pin', online: 'video' } as const;

/** Cartão de curso ou apostila, igual em todas as listas. */
export function CartaoProduto({ p }: { p: Produto }) {
  return (
    <Link className="card flex flex-col" href={p.href}>
      <div className="photo aspect-[4/3] rounded-b-none"><img src={foto(p.img)} alt={p.alt} width={480} height={640} loading="lazy" style={{ objectPosition: p.pos }} /></div>
      <div className="flex flex-1 flex-col gap-3 p-5 lg:p-6">
        <span className="tag self-start"><Icon name={p.formato ? ICONE[p.formato] : 'file'} size={14} />{p.tag}</span>
        <h3 className="t-h3">{p.titulo}</h3>
        <p className="text-muted">{p.texto}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <PrecoProduto p={p} />
          <span className="btn btn-pri">{p.cta}</span>
        </div>
      </div>
    </Link>
  );
}

/** Lista de produtos em grade: 1 coluna no celular, 2 no tablet, 3 no desktop. */
export function GradeProdutos({ itens }: { itens: Produto[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {itens.map((p) => <CartaoProduto key={p.id} p={p} />)}
    </div>
  );
}

/** Atalhos "Ver todos os cursos" / "Ver todas as apostilas". */
export function AtalhosCatalogo({ className = '' }: { className?: string }) {
  return (
    <nav className={`grid gap-3 sm:grid-cols-2 ${className}`} aria-label="Catálogo">
      <Link className="card flex items-center gap-4 p-4 lg:p-5" href="/cursos">
        <div className="ficon"><Icon name="cap" /></div>
        <div className="flex min-w-0 flex-1 flex-col"><b>Ver todos os cursos</b><span className="text-sm text-muted">Presenciais e online, com preços</span></div>
        <Icon name="arrow-right" className="text-accent" />
      </Link>
      <Link className="card flex items-center gap-4 p-4 lg:p-5" href="/apostilas">
        <div className="ficon"><Icon name="book" /></div>
        <div className="flex min-w-0 flex-1 flex-col"><b>Ver todas as apostilas</b><span className="text-sm text-muted">Material em PDF, com preços</span></div>
        <Icon name="arrow-right" className="text-accent" />
      </Link>
    </nav>
  );
}
