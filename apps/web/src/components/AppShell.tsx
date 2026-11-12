import Link from 'next/link';
import { Icon, type IconName } from './Icon';
import { Logo } from './Site';
import { WA, foto } from '@/lib/site';

type Item = { href: string; icon: IconName; label: string; curto?: string };

const ALUNA: Item[] = [
  { href: '/aluna', icon: 'cap', label: 'Meus cursos', curto: 'Cursos' },
  { href: '/catalogo', icon: 'grid', label: 'Catálogo' },
  { href: '/aluna#certificados', icon: 'award', label: 'Certificados' },
  { href: '/aluna#perfil', icon: 'user', label: 'Meu perfil', curto: 'Perfil' },
];
const ADMIN: Item[] = [
  { href: '/admin#resumo', icon: 'home', label: 'Resumo' },
  { href: '/admin', icon: 'inbox', label: 'Pedidos de inscrição', curto: 'Pedidos' },
  { href: '/admin/curso', icon: 'cap', label: 'Cursos e materiais', curto: 'Cursos' },
  { href: '/admin#alunas', icon: 'users', label: 'Alunas' },
];

/** Casca da área logada: menu lateral no desktop, barra de abas no celular. */
export function AppShell({ area, ativo, children }: { area: 'aluna' | 'admin'; ativo: string; children: React.ReactNode }) {
  const itens = area === 'aluna' ? ALUNA : ADMIN;
  const nome = area === 'aluna' ? 'Área da aluna' : 'Painel';
  return (
    <div className="lg:flex lg:min-h-screen">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-bg px-5 lg:hidden">
        <Logo />
        <span className="t-label">{nome}</span>
      </header>
      <aside className="sticky top-0 hidden h-screen w-[264px] flex-none flex-col gap-8 border-r border-line bg-surface px-4 py-7 lg:flex">
        <Logo className="px-3" />
        <nav className="menu flex flex-col gap-1" aria-label={nome}>
          {itens.map((i) => (
            <Link key={i.label} href={i.href} aria-current={i.href === ativo ? 'page' : undefined}>
              <Icon name={i.icon} />{i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          {area === 'aluna' ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-bg p-5">
              <b>Precisa de ajuda?</b>
              <span className="text-sm text-muted">Fale direto com a Camilla.</span>
              <a className="btn btn-pri" href={WA}><Icon name="whatsapp" size={18} />WhatsApp</a>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3">
              <img className="round h-10 w-10 flex-none rounded-full object-cover" src={foto('pdf-curso-p10-06.jpg')} alt="" width={40} height={40} />
              <div className="flex flex-col"><b className="text-sm">Camilla Gama</b><span className="text-sm text-muted">Administradora</span></div>
            </div>
          )}
        </div>
      </aside>
      <main id="conteudo" className="min-w-0 flex-1 pb-[72px] lg:pb-0">{children}</main>
      <nav className="tabbar fixed inset-x-0 bottom-0 z-10 flex h-[72px] border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label={nome}>
        {itens.map((i) => (
          <Link key={i.label} href={i.href} aria-current={i.href === ativo ? 'page' : undefined}>
            <Icon name={i.icon} />{i.curto ?? i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
