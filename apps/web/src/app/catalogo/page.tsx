import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { Contagem, ListaProdutos } from '@/components/Produto';
import { SiteFooter, SiteNav } from '@/components/Site';
import type { Filtro } from '@/lib/catalogo';

export const metadata: Metadata = { title: 'Catálogo' };

const GRUPOS: { id: string; icon: IconName; titulo: string; texto: string; filtro: Filtro; todos: [string, string] }[] = [
  { id: 'presenciais', icon: 'map-pin', titulo: 'Cursos presenciais', texto: 'Em Osasco-SP, com kit, prática e acompanhamento de perto.', filtro: { tipo: 'curso', formato: 'presencial' }, todos: ['/cursos#presenciais', 'Ver todos os cursos'] },
  { id: 'online', icon: 'video', titulo: 'Cursos online', texto: 'Aulas gravadas para assistir no seu ritmo, com apostila e certificado.', filtro: { tipo: 'curso', formato: 'online' }, todos: ['/cursos#online', 'Ver todos os cursos'] },
  { id: 'apostilas', icon: 'file', titulo: 'Apostilas', texto: 'Material em PDF para ler, reler e treinar.', filtro: { tipo: 'apostila' }, todos: ['/apostilas', 'Ver todas as apostilas'] },
];

export default function Catalogo() {
  return (
    <>
      <SiteNav />
      <main id="conteudo" className="wrap pt-8 pb-14 lg:pt-[72px] lg:pb-24">
        <div className="flex flex-col gap-4">
          <h1 className="t-h1">Catálogo</h1>
          <p className="lead text-muted">Todos os cursos e apostilas da Camilla. Você pede por aqui, combina o pagamento no WhatsApp e recebe o acesso na sua área de aluna.</p>
        </div>
        <nav className="flex flex-wrap gap-2 pt-6 pb-2 lg:pt-8" aria-label="Seções do catálogo">
          {GRUPOS.map((g) => (
            <a key={g.id} className="tag tag-lk" href={`#${g.id}`}><Icon name={g.icon} size={14} />{g.titulo} · <Contagem filtro={g.filtro} /></a>
          ))}
        </nav>
        {GRUPOS.map((g) => (
          <section key={g.id} id={g.id} className="flex flex-col gap-6 pt-10 lg:pt-14">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-2"><h2 className="t-h2">{g.titulo}</h2><p className="text-muted">{g.texto}</p></div>
              <Link className="go self-start lg:self-auto" href={g.todos[0]}>{g.todos[1]}<Icon name="arrow-right" size={18} /></Link>
            </div>
            <ListaProdutos filtro={g.filtro} />
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
