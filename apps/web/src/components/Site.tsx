'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from './Icon';
import { CURSO, INSTAGRAM, WA, WA_LABEL } from '@/lib/site';

export function Logo({ className = '', href = '/' }: { className?: string; href?: string }) {
  return (
    <Link className={`logo ${className}`} href={href} translate="no">
      Camilla <span>Lash</span>
    </Link>
  );
}

// Páginas do catálogo: no topo do menu do celular, com ícone e descrição.
const PRINCIPAIS = [
  ['/catalogo', 'Catálogo', 'grid', 'Cursos e apostilas, com preços'],
  ['/cursos', 'Cursos', 'cap', 'Presenciais e online'],
  ['/apostilas', 'Apostilas', 'book', 'Material em PDF'],
] as const;
// Seções da home.
const SECOES = [
  ['/#sobre', 'Sobre'],
  ['/#atendimentos', 'Atendimentos'],
  ['/#resultados', 'Resultados'],
  ['/#duvidas', 'Dúvidas'],
] as const;
const LINKS = [...PRINCIPAIS.map(([h, t]) => [h, t] as const), ...SECOES];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className="wrap flex h-14 items-center justify-between lg:h-[72px]">
        <Logo />
        <nav className="navlinks hidden items-center gap-6 text-[15px] xl:gap-8 lg:flex" aria-label="Principal">
          {LINKS.map(([href, t]) => (
            <Link key={href} href={href} className="py-1.5">{t}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link className="btn btn-sec" href="/entrar"><Icon name="user" size={18} />Área da aluna</Link>
          <a className="btn btn-pri" href={WA}><Icon name="whatsapp" size={18} />Agendar no WhatsApp</a>
        </div>
        <button className="icb -mr-3 lg:hidden" type="button" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'x' : 'menu'} />
        </button>
      </div>
      {open && (
        <nav id="menu-mobile" className="absolute inset-x-0 top-full z-20 flex h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto overscroll-contain border-t border-line bg-bg px-5 py-6 lg:hidden" aria-label="Principal">
          <div className="flex flex-col gap-3">
            {PRINCIPAIS.map(([href, t, ic, d]) => (
              <Link key={href} href={href} className="card flex items-center gap-4 p-4" onClick={() => setOpen(false)}>
                <div className="ficon"><Icon name={ic} /></div>
                <div className="flex min-w-0 flex-1 flex-col"><b className="text-[17px]">{t}</b><span className="text-sm text-muted">{d}</span></div>
                <Icon name="arrow-right" className="text-accent" />
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col">
            {SECOES.map(([href, t]) => (
              <Link key={href} href={href} className="t-h3 border-b border-line py-4" onClick={() => setOpen(false)}>{t}</Link>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link className="btn btn-sec" href="/entrar" onClick={() => setOpen(false)}><Icon name="user" size={18} />Área da aluna</Link>
            <a className="btn btn-pri" href={WA}><Icon name="whatsapp" size={18} />Agendar no WhatsApp</a>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="wrap">
      <div className="flex flex-col gap-5 border-t border-line py-10 text-[15px] lg:flex-row lg:items-center lg:justify-between">
        <Logo />
        <div className="flex flex-col gap-3 text-muted lg:flex-row lg:items-center lg:gap-6">
          <span className="flex items-center gap-2"><Icon name="map-pin" size={18} />Osasco-SP</span>
          <a className="link-ul flex items-center gap-2 self-start" href={INSTAGRAM}><Icon name="instagram" size={18} />@camillagama_lash</a>
          <a className="link-ul num flex items-center gap-2 self-start" href={WA}><Icon name="whatsapp" size={18} />{WA_LABEL}</a>
        </div>
        <span className="text-sm text-muted">© 2026 Camilla Gama · Lash Designer</span>
      </div>
    </footer>
  );
}

/** Preço atual e, se houver, o preço original riscado com o selo de desconto. */
export function Preco({ size = 28, sufixo }: { size?: number; sufixo?: string }) {
  return (
    <span className="flex flex-col gap-2">
      {CURSO.precoOriginal && (
        <span className="flex items-center gap-2">
          <s className="was num"><span className="sr">Preço anterior: </span>{CURSO.precoOriginal}</s>
          <span className="tag tag-off">{CURSO.desconto}</span>
        </span>
      )}
      <span>
        <span className="price num" style={{ fontSize: size }}>{CURSO.preco}</span>
        {sufixo && <span className="text-sm text-muted"> {sufixo}</span>}
      </span>
    </span>
  );
}

export function Checks({ itens, icon = 'check', className = '' }: { itens: readonly string[]; icon?: 'check'; className?: string }) {
  return (
    <ul className={`checks ${className}`}>
      {itens.map((t) => (
        <li key={t}><Icon name={icon} />{t}</li>
      ))}
    </ul>
  );
}
