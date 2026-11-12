import Link from 'next/link';
import type { Metadata } from 'next';
import { FormDemo } from '@/components/Interativos';
import { Logo } from '@/components/Site';

export const metadata: Metadata = { title: 'Área da aluna' };

export default function Entrar() {
  return (
    <main id="conteudo" className="flex min-h-[calc(100vh-34px)] flex-col lg:flex-row">
      <div className="alt flex flex-col items-center justify-center gap-2 px-5 pt-16 pb-10 text-center lg:flex-1 lg:gap-4 lg:p-20">
        <Logo className="!text-[48px] lg:!text-[88px]" />
        <span className="t-label lg:text-[19px]">Lash designer · Osasco-SP</span>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 lg:w-[640px] lg:flex-none lg:px-[110px] lg:py-20">
        <FormDemo to="/aluna" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="t-h1 text-[38px] lg:text-[52px]">Área da aluna</h1>
            <p className="text-muted">Entre para assistir às aulas e baixar sua apostila.</p>
          </div>
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" spellCheck={false} placeholder="voce@exemplo.com…" /></div>
          <div className="field">
            <div className="flex items-center justify-between"><label htmlFor="senha">Senha</label><Link className="link-ul text-sm font-semibold text-accent" href="/entrar#esqueci">Esqueci a senha</Link></div>
            <input id="senha" name="senha" type="password" autoComplete="current-password" />
          </div>
          <button className="btn btn-pri btn-lg w-full" type="submit">Entrar</button>
          <p className="text-center text-sm text-muted">Ainda não é aluna? <Link className="link-ul font-semibold text-accent" href="/catalogo">Conheça os cursos</Link></p>
          <p className="text-center text-[13px] text-muted">Teste: qualquer e-mail e senha entram na área de exemplo.</p>
        </FormDemo>
      </div>
    </main>
  );
}
