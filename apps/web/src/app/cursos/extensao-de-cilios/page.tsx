import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { Investimento } from '@/components/Interativos';
import { Checks, SiteFooter, SiteNav } from '@/components/Site';
import { DIA1, DIA2, KIT, TECNICAS, foto } from '@/lib/site';

export const metadata: Metadata = { title: 'Curso de Extensão de Cílios' };

export default function PaginaCurso() {
  return (
    <>
      <SiteNav />
      <main id="conteudo" className="wrap flex flex-col gap-10 pt-6 pb-14 lg:flex-row lg:items-start lg:gap-16 lg:pt-14 lg:pb-24">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <nav className="text-sm text-muted" aria-label="Você está em"><Link className="link-ul" href="/catalogo">Cursos</Link> / Extensão de Cílios — Iniciante</nav>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="tag"><Icon name="map-pin" size={14} />Presencial · Osasco-SP</span>
              <span className="tag"><Icon name="video" size={14} />Online</span>
              <span className="tag">Iniciante</span>
            </div>
            <h1 className="t-h1">Curso de Extensão de Cílios</h1>
            <p className="lead text-muted">Um intensivo de 2&nbsp;dias para entrar no mercado com segurança: teoria, treino e prática com modelo real. Também disponível online, em aulas gravadas.</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 text-[15px] lg:flex lg:gap-8">
            <li className="flex items-center gap-2.5"><Icon name="calendar" className="text-accent" />2&nbsp;dias intensivos</li>
            <li className="flex items-center gap-2.5"><Icon name="eye" className="text-accent" />5&nbsp;técnicas</li>
            <li className="flex items-center gap-2.5"><Icon name="package" className="text-accent" />Kit com 20&nbsp;itens</li>
            <li className="flex items-center gap-2.5"><Icon name="award" className="text-accent" />Certificado</li>
          </ul>
          <div className="photo h-[240px] lg:h-[420px]">
            <img src={foto('post-10.jpg')} alt="Camilla e uma aluna com o certificado do curso" width={480} height={640} style={{ objectPosition: '50% 30%' }} />
          </div>

          {/* No celular o investimento aparece aqui, antes do programa */}
          <div className="lg:hidden"><Investimento /></div>

          <h2 className="t-h2 pt-4">Seu passo a passo em 2&nbsp;dias</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
            <div className="card flex flex-col gap-4 p-5 lg:p-7"><span className="tag self-start">Dia 1</span><h3 className="t-h3">Teoria e treinamento</h3><Checks itens={DIA1} /></div>
            <div className="card flex flex-col gap-4 p-5 lg:p-7"><span className="tag self-start">Dia 2</span><h3 className="t-h3">Prática com modelo</h3><Checks itens={DIA2} /></div>
          </div>

          <h2 className="t-h2 pt-4">Técnicas que você vai aprender</h2>
          <div className="flex flex-wrap gap-2">{TECNICAS.map((t) => <span key={t} className="tag">{t}</span>)}</div>

          <h2 className="t-h2 pt-4">Kit profissional <span>com 20&nbsp;itens</span></h2>
          <Checks itens={KIT} className="columns-2 gap-4 text-sm lg:gap-12 lg:text-base" />
        </div>
        <aside className="hidden w-[400px] flex-none lg:sticky lg:top-24 lg:block" aria-label="Investimento">
          <Investimento />
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
