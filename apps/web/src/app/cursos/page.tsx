import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { GradeProdutos } from '@/components/Produto';
import { SiteFooter, SiteNav } from '@/components/Site';
import { CURSOS } from '@/lib/site';

export const metadata: Metadata = { title: 'Cursos' };

const presenciais = CURSOS.filter((c) => c.formato === 'presencial');
const online = CURSOS.filter((c) => c.formato === 'online');

export default function Cursos() {
  return (
    <>
      <SiteNav />
      <main id="conteudo" className="wrap pt-8 pb-14 lg:pt-[72px] lg:pb-24">
        <div className="flex flex-col gap-4">
          <h1 className="t-h1">Cursos</h1>
          <p className="lead text-muted">Presenciais em Osasco-SP ou online, no seu ritmo. Você se inscreve por aqui e combina o pagamento no WhatsApp.</p>
        </div>
        <nav className="flex flex-wrap gap-2 pt-6 pb-2 lg:pt-8" aria-label="Formatos">
          <a className="tag tag-lk" href="#presenciais"><Icon name="map-pin" size={14} />Presenciais · {presenciais.length}</a>
          <a className="tag tag-lk" href="#online"><Icon name="video" size={14} />Online · {online.length}</a>
          <Link className="tag tag-lk" href="/apostilas"><Icon name="file" size={14} />Ver apostilas</Link>
        </nav>

        <section id="presenciais" className="flex flex-col gap-6 pt-10 lg:pt-12">
          <div className="flex flex-col gap-2"><h2 className="t-h2">Presenciais</h2><p className="text-muted">Em Osasco-SP, com kit, prática e acompanhamento de perto.</p></div>
          <GradeProdutos itens={presenciais} />
        </section>

        <section id="online" className="flex flex-col gap-6 pt-14 lg:pt-16">
          <div className="flex flex-col gap-2"><h2 className="t-h2">Online</h2><p className="text-muted">Aulas gravadas para assistir quando quiser, com apostila e certificado.</p></div>
          <GradeProdutos itens={online} />
        </section>

        <Link className="card mt-14 flex items-center gap-4 p-5 lg:mt-16" href="/apostilas">
          <div className="ficon"><Icon name="book" /></div>
          <div className="flex min-w-0 flex-1 flex-col"><b>Prefere estudar pela apostila?</b><span className="text-sm text-muted">Ver todas as apostilas</span></div>
          <Icon name="arrow-right" className="text-accent" />
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
