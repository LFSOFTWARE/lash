import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { Preco, SiteFooter, SiteNav } from '@/components/Site';
import { WA, foto } from '@/lib/site';

export const metadata: Metadata = { title: 'Cursos e apostilas' };

type Card = { href: string; img: string; alt: string; pos: string; icon: IconName; tag: string; titulo: string; texto: string; preco?: boolean; cta: string; ctaSec?: boolean };

const GRUPOS: { id: string; icon: IconName; titulo: string; curto: string; texto: string; itens: Card[] }[] = [
  {
    id: 'presenciais', icon: 'map-pin', titulo: 'Cursos presenciais', curto: 'Presenciais', texto: 'Em Osasco-SP, com kit, prática e acompanhamento de perto.',
    itens: [
      { href: '/cursos/extensao-de-cilios', img: 'pdf-curso-p3-03.jpg', alt: 'Extensão de cílios vista de perfil', pos: '50% 35%', icon: 'map-pin', tag: 'Presencial · 2 dias', titulo: 'Extensão de Cílios — Iniciante', texto: 'Cinco técnicas, kit com 20 itens, apostila e certificado.', preco: true, cta: 'Quero me inscrever' },
      { href: WA, img: 'post-12.jpg', alt: 'Cliente com sobrancelhas desenhadas', pos: '50% 20%', icon: 'map-pin', tag: 'Presencial', titulo: 'Design de Sobrancelhas', texto: 'Próximas turmas sob consulta.', cta: 'Consultar datas', ctaSec: true },
    ],
  },
  {
    id: 'online', icon: 'video', titulo: 'Cursos online', curto: 'Online', texto: 'Aulas gravadas para assistir no seu ritmo, com apostila e certificado.',
    itens: [
      { href: '/cursos/extensao-de-cilios', img: 'post-04.jpg', alt: 'Cílios com extensão em volume', pos: '50% 40%', icon: 'video', tag: 'Online · aulas gravadas', titulo: 'Extensão de Cílios — Iniciante', texto: 'As cinco técnicas, da biossegurança ao volume marrom.', cta: 'Quero me inscrever' },
    ],
  },
  {
    id: 'apostilas', icon: 'file', titulo: 'Apostilas', curto: 'Apostilas', texto: 'Material em PDF para ler, reler e treinar.',
    itens: [
      { href: '/inscricao', img: 'pdf-apostila-p1-07.jpg', alt: 'Capa da apostila profissional de extensão de cílios', pos: '50% 18%', icon: 'file', tag: 'PDF · 30 páginas', titulo: 'Apostila Profissional de Extensão de Cílios', texto: 'Todo o conteúdo teórico do curso em um material só.', cta: 'Quero comprar' },
    ],
  },
];

function Cartao({ c }: { c: Card }) {
  const externo = c.href.startsWith('http');
  const corpo = (
    <>
      <div className="photo aspect-[4/3] rounded-b-none"><img src={foto(c.img)} alt={c.alt} width={480} height={640} loading="lazy" style={{ objectPosition: c.pos }} /></div>
      <div className="flex flex-col gap-3 p-5 lg:p-6">
        <span className="tag self-start"><Icon name={c.icon} size={14} />{c.tag}</span>
        <h3 className="t-h3">{c.titulo}</h3>
        <p className="text-muted">{c.texto}</p>
        <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
          {c.preco ? <Preco /> : <span className="text-sm text-muted">Valor sob consulta</span>}
          <span className={`btn ${c.ctaSec ? 'btn-sec' : 'btn-pri'}`}>{c.ctaSec && <Icon name="whatsapp" size={18} />}{c.cta}</span>
        </div>
      </div>
    </>
  );
  return externo ? <a className="card flex flex-col" href={c.href}>{corpo}</a> : <Link className="card flex flex-col" href={c.href}>{corpo}</Link>;
}

export default function Catalogo() {
  return (
    <>
      <SiteNav />
      <main id="conteudo" className="wrap pt-8 pb-14 lg:pt-[72px] lg:pb-24">
        <div className="flex flex-col gap-4">
          <h1 className="t-h1">Cursos e apostilas</h1>
          <p className="lead text-muted">Você pede por aqui, combina o pagamento no WhatsApp e recebe o acesso na sua área de aluna.</p>
        </div>
        <nav className="flex flex-wrap gap-2 pt-6 pb-8 lg:pt-8 lg:pb-12" aria-label="Seções do catálogo">
          {GRUPOS.map((g) => (
            <a key={g.id} className="tag tag-lk" href={`#${g.id}`}><Icon name={g.icon} size={14} />{g.curto} · {g.itens.length}</a>
          ))}
        </nav>
        {GRUPOS.map((g) => (
          <section key={g.id} id={g.id} className="flex flex-col gap-6 border-t border-line py-10 lg:flex-row lg:items-start lg:gap-16 lg:py-12">
            <div className="flex flex-col gap-3 lg:w-[300px] lg:flex-none">
              <h2 className="t-h2 lg:text-[40px]">{g.titulo}</h2>
              <p className="text-muted">{g.texto}</p>
            </div>
            <div className="grid min-w-0 flex-1 gap-6 md:grid-cols-2">
              {g.itens.map((c) => <Cartao key={c.titulo + c.tag} c={c} />)}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
