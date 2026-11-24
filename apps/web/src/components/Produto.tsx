'use client';

import Link from 'next/link';
import { Icon } from './Icon';
import { cartao, filtrar, useCatalogo, type Cartao, type Filtro } from '@/lib/catalogo';
import { WA } from '@/lib/site';

/** Preço do produto: original riscado + selo (se houver), preço atual e parcelas. */
export function PrecoProduto({ p, size = 28, sufixo }: { p: Cartao; size?: number; sufixo?: string }) {
  return (
    <span className="flex flex-col gap-1.5">
      {p.precoOriginal && (
        <span className="flex items-center gap-2">
          <s className="was num"><span className="sr">Preço anterior: </span>{p.precoOriginal}</s>
          {p.desconto && <span className="tag tag-off">{p.desconto}</span>}
        </span>
      )}
      <span>
        <span className="price num" style={{ fontSize: size }}>{p.preco}</span>
        {sufixo && <span className="text-sm text-muted"> {sufixo}</span>}
      </span>
      {!sufixo && p.parcelas && <span className="text-[13px] text-muted">{p.parcelas}</span>}
    </span>
  );
}

/** Espaço reservado enquanto o preço chega da API. */
export function PrecoCarregando({ size = 28 }: { size?: number }) {
  return <span className="block animate-pulse rounded-lg bg-line" style={{ height: size * 1.2, width: size * 4 }} aria-label="Carregando preço" />;
}

/** Preço de um produto do catálogo pelo slug (home, página do curso). */
export function PrecoDe({ slug, size, sufixo }: { slug: string; size?: number; sufixo?: string }) {
  const { produtos } = useCatalogo();
  const p = produtos?.find((x) => x.slug === slug);
  if (!produtos) return <PrecoCarregando size={size} />;
  if (!p) return <span className="text-muted">Consulte pelo WhatsApp</span>;
  return <PrecoProduto p={cartao(p)} size={size} sufixo={sufixo} />;
}

const ICONE = { presencial: 'map-pin', online: 'video' } as const;

/** Cartão de curso ou apostila, igual em todas as listas. */
export function CartaoProduto({ p }: { p: Cartao }) {
  return (
    <Link className="card flex flex-col" href={p.href}>
      <div className="photo aspect-[4/3] rounded-b-none"><img src={p.img} alt={p.titulo} width={480} height={640} loading="lazy" style={{ objectPosition: p.pos }} /></div>
      <div className="flex flex-1 flex-col gap-3 p-5 lg:p-6">
        <span className="tag self-start"><Icon name={p.formato ? ICONE[p.formato] : p.tipo === 'combo' ? 'package' : 'file'} size={14} />{p.tag}</span>
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
export function ListaProdutos({ filtro, vazio = 'Em breve. Fale com a Camilla no WhatsApp para saber das próximas turmas.' }: { filtro?: Filtro; vazio?: string }) {
  const { produtos, erro } = useCatalogo();
  if (erro && !produtos)
    return (
      <div className="card flex flex-col items-start gap-3 p-6" role="alert">
        <b>Não foi possível carregar o catálogo.</b>
        <span className="text-muted">{erro}</span>
        <a className="btn btn-sec" href={WA}><Icon name="whatsapp" size={18} />Perguntar no WhatsApp</a>
      </div>
    );
  const itens = produtos && filtrar(produtos, filtro);
  if (itens && !itens.length) return <p className="card p-6 text-muted">{vazio}</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-busy={!itens}>
      {itens
        ? itens.map((p) => <CartaoProduto key={p.id} p={cartao(p)} />)
        : [0, 1, 2].map((i) => <div key={i} className="card h-[440px] animate-pulse" />)}
    </div>
  );
}

/** Quantos produtos há no filtro (para os atalhos do topo). */
export function Contagem({ filtro }: { filtro?: Filtro }) {
  const { produtos } = useCatalogo();
  return <>{produtos ? filtrar(produtos, filtro).length : '…'}</>;
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
