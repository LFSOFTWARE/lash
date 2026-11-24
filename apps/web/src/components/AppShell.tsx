'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import { Icon, type IconName } from './Icon';
import { Logo } from './Site';
import { Carregando, iniciais } from './ui';
import { gravarSessao, sair, usaApi, useSessao } from '@/lib/api';
import { WA, foto } from '@/lib/site';
import type { Usuaria } from '@/lib/tipos';

type Item = { href: string; icon: IconName; label: string; curto?: string };

const ALUNA: Item[] = [
  { href: '/aluna', icon: 'cap', label: 'Meus cursos', curto: 'Cursos' },
  { href: '/catalogo', icon: 'grid', label: 'Catálogo' },
  { href: '/aluna#certificados', icon: 'award', label: 'Certificados' },
  { href: '/aluna#perfil', icon: 'user', label: 'Meu perfil', curto: 'Perfil' },
];
const ADMIN: Item[] = [
  { href: '/admin', icon: 'inbox', label: 'Pedidos de inscrição', curto: 'Pedidos' },
  { href: '/admin/alunas', icon: 'users', label: 'Alunas' },
  { href: '/admin/curso', icon: 'cap', label: 'Cursos e materiais', curto: 'Cursos' },
];

// Contas usadas no modo de exemplo, para as telas abrirem direto no GitHub Pages.
const EXEMPLO: Record<'aluna' | 'admin', Usuaria> = {
  aluna: { id: 'u-ana', nome: 'Ana Souza', email: 'ana@exemplo.com', whatsapp: '11900000001', papel: 'aluna' },
  admin: { id: 'u-camilla', nome: 'Camilla Gama', email: 'camilla@example.com', whatsapp: '11947692668', papel: 'admin' },
};

const UsuariaCtx = createContext<Usuaria | null>(null);

// Ao sair de propósito, o login abre sem "voltar para" a página de onde saiu.
let saindo = false;
export async function sairDaConta(router: ReturnType<typeof useRouter>) {
  saindo = true;
  await sair();
  router.replace('/entrar');
  setTimeout(() => (saindo = false), 1000);
}
/** Quem está logada (dentro da área da aluna ou do painel). */
export function useUsuaria() {
  return useContext(UsuariaCtx)!;
}

/** Exige login: sem sessão vai para /entrar; aluna no painel vai para /aluna. */
export function useAcesso(area: 'aluna' | 'admin') {
  const sessao = useSessao();
  const router = useRouter();
  const rota = usePathname();
  const u = sessao?.usuaria;
  // No modo de exemplo, cada área abre com a conta de exemplo dela (a Camilla não aparece como aluna).
  const trocarExemplo = !usaApi && area === 'aluna' && u?.papel === 'admin';
  const negado = sessao !== undefined && (!u || (area === 'admin' && u.papel !== 'admin') || trocarExemplo);
  useEffect(() => {
    if (!negado) return;
    if (!usaApi) return gravarSessao({ usuaria: EXEMPLO[area] });
    if (!u) router.replace(saindo ? '/entrar' : `/entrar?volta=${encodeURIComponent(rota + location.search)}`);
    else router.replace('/aluna');
  }, [negado, u, area, rota, router]);
  return negado ? null : (u ?? null);
}

/** Casca da área logada: menu lateral no desktop, barra de abas no celular. */
export function AppShell({ area, ativo, children }: { area: 'aluna' | 'admin'; ativo: string; children: React.ReactNode }) {
  const u = useAcesso(area);
  const router = useRouter();
  const itens = area === 'aluna' ? ALUNA : ADMIN;
  const nome = area === 'aluna' ? 'Área da aluna' : 'Painel';
  const sairAgora = () => sairDaConta(router);
  return (
    <div className="lg:flex lg:min-h-screen">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-bg px-5 lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <span className="t-label">{nome}</span>
          {u && <button className="icb -mr-3" type="button" onClick={sairAgora} aria-label="Sair da conta"><Icon name="log-out" /></button>}
        </div>
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
        <div className="mt-auto flex flex-col gap-4">
          {area === 'aluna' && (
            <div className="flex flex-col gap-3 rounded-2xl bg-bg p-5">
              <b>Precisa de ajuda?</b>
              <span className="text-sm text-muted">Fale direto com a Camilla.</span>
              <a className="btn btn-pri" href={WA}><Icon name="whatsapp" size={18} />WhatsApp</a>
            </div>
          )}
          {u && (
            <div className="flex items-center gap-3 px-3">
              {area === 'admin' ? (
                <img className="round h-10 w-10 flex-none rounded-full object-cover" src={foto('pdf-curso-p10-06.jpg')} alt="" width={40} height={40} />
              ) : (
                <div className="ini" aria-hidden="true">{iniciais(u.nome)}</div>
              )}
              <div className="flex min-w-0 flex-1 flex-col"><b className="truncate text-sm">{u.nome}</b><span className="text-sm text-muted">{area === 'admin' ? 'Administradora' : 'Aluna'}</span></div>
              <button className="icb h-10 w-10 text-muted" type="button" onClick={sairAgora} aria-label="Sair da conta" title="Sair"><Icon name="log-out" size={18} /></button>
            </div>
          )}
        </div>
      </aside>
      <main id="conteudo" className="min-w-0 flex-1 pb-[72px] lg:pb-0">
        {u ? <UsuariaCtx.Provider value={u}>{children}</UsuariaCtx.Provider> : <Carregando />}
      </main>
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
