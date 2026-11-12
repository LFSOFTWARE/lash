import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { GradeProdutos } from '@/components/Produto';
import { SiteFooter, SiteNav } from '@/components/Site';
import { APOSTILAS } from '@/lib/site';

export const metadata: Metadata = { title: 'Apostilas' };

export default function Apostilas() {
  return (
    <>
      <SiteNav />
      <main id="conteudo" className="wrap pt-8 pb-14 lg:pt-[72px] lg:pb-24">
        <div className="flex flex-col gap-4 pb-10 lg:pb-12">
          <h1 className="t-h1">Apostilas</h1>
          <p className="lead text-muted">Material em PDF para ler, reler e treinar. Depois da confirmação do pagamento, o arquivo fica na sua área de aluna.</p>
        </div>
        <GradeProdutos itens={APOSTILAS} />
        <Link className="card mt-14 flex items-center gap-4 p-5 lg:mt-16" href="/cursos">
          <div className="ficon"><Icon name="cap" /></div>
          <div className="flex min-w-0 flex-1 flex-col"><b>Quer aprender na prática?</b><span className="text-sm text-muted">Ver todos os cursos</span></div>
          <Icon name="arrow-right" className="text-accent" />
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
