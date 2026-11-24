'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Site';
import { Aviso } from './ui';
import { api, gravarSessao, textoErro, usaApi } from '@/lib/api';
import type { RespostaLogin } from '@/lib/tipos';

/** Login, "esqueci a senha" e criar senha: a marca de um lado, o formulário do outro. */
export function TelaConta({ children }: { children: React.ReactNode }) {
  return (
    <main id="conteudo" className="flex min-h-[calc(100vh-34px)] flex-col lg:flex-row">
      <div className="alt flex flex-col items-center justify-center gap-2 px-5 pt-16 pb-10 text-center lg:flex-1 lg:gap-4 lg:p-20">
        <Logo className="!text-[48px] lg:!text-[88px]" />
        <span className="t-label lg:text-[19px]">Lash designer · Osasco-SP</span>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 lg:w-[640px] lg:flex-none lg:px-[110px] lg:py-20">{children}</div>
    </main>
  );
}

/** Só aceita voltar para uma página do próprio site. */
const destinoSeguro = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : null);

export function FormEntrar() {
  const router = useRouter();
  const volta = destinoSeguro(useSearchParams().get('volta'));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [esqueci, setEsqueci] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    const f = new FormData(e.currentTarget);
    try {
      const r = await api<RespostaLogin>('/auth/login', { metodo: 'POST', corpo: { email: f.get('email'), senha: f.get('senha') } });
      gravarSessao(r);
      router.replace(volta ?? (r.usuaria.papel === 'admin' ? '/admin' : '/aluna'));
    } catch (err) {
      setErro(textoErro(err));
      setEnviando(false);
    }
  }

  if (esqueci) return <EsqueciSenha voltar={() => setEsqueci(false)} />;

  return (
    <form className="flex flex-col gap-6" onSubmit={entrar}>
      <div className="flex flex-col gap-3">
        <h1 className="t-h1 text-[38px] lg:text-[52px]">Área da aluna</h1>
        <p className="text-muted">Entre para assistir às aulas e baixar sua apostila.</p>
      </div>
      <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" spellCheck={false} required placeholder="voce@exemplo.com…" /></div>
      <div className="field">
        <div className="flex items-center justify-between"><label htmlFor="senha">Senha</label><button className="link-ul text-sm font-semibold text-accent" type="button" onClick={() => setEsqueci(true)}>Esqueci a senha</button></div>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required />
      </div>
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn btn-pri btn-lg w-full" type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      <p className="text-center text-sm text-muted">Ainda não é aluna? <Link className="link-ul font-semibold text-accent" href="/catalogo">Conheça os cursos</Link></p>
      {!usaApi && <p className="text-center text-[13px] text-muted">Teste: qualquer e-mail e senha entram na área de exemplo. Um e-mail com “camilla” abre o painel.</p>}
    </form>
  );
}

function EsqueciSenha({ voltar }: { voltar: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [r, setR] = useState<{ mensagem: string; whatsappUrl: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function pedir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      setR(await api('/auth/esqueci-senha', { metodo: 'POST', corpo: { email: new FormData(e.currentTarget).get('email') } }));
    } catch (err) {
      setErro(textoErro(err));
    }
    setEnviando(false);
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={pedir}>
      <button className="go self-start text-muted" type="button" onClick={voltar}><Icon name="arrow-left" size={18} />Voltar para o login</button>
      <div className="flex flex-col gap-3">
        <h1 className="t-h1 text-[38px] lg:text-[52px]">Esqueci a senha</h1>
        <p className="text-muted">A Camilla te manda pelo WhatsApp um link para criar uma senha nova.</p>
      </div>
      {r ? (
        <>
          <Aviso tipo="info">{r.mensagem}</Aviso>
          <a className="btn btn-pri btn-lg w-full" href={r.whatsappUrl}><Icon name="whatsapp" size={18} />Falar com a Camilla</a>
        </>
      ) : (
        <>
          <div className="field"><label htmlFor="email-esqueci">E-mail da sua conta</label><input id="email-esqueci" name="email" type="email" autoComplete="username" spellCheck={false} required autoFocus placeholder="voce@exemplo.com…" /></div>
          {erro && <Aviso>{erro}</Aviso>}
          <button className="btn btn-pri btn-lg w-full" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Continuar'}</button>
        </>
      )}
    </form>
  );
}

/** Página do link que a Camilla manda: /redefinir-senha?token=… */
export function FormRedefinir() {
  const token = useSearchParams().get('token');
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get('senha') !== f.get('confirmar')) return setErro('As duas senhas não são iguais.');
    setEnviando(true);
    setErro(null);
    try {
      await api('/auth/redefinir-senha', { metodo: 'POST', corpo: { token, senha: f.get('senha') } });
      setPronto(true);
    } catch (err) {
      setErro(textoErro(err));
    }
    setEnviando(false);
  }

  if (!token) return <Aviso>Link incompleto. Peça um link novo para a Camilla no WhatsApp.</Aviso>;
  if (pronto)
    return (
      <div className="flex flex-col gap-6">
        <Aviso tipo="ok">Senha criada. Agora é só entrar com o seu e-mail e a senha nova.</Aviso>
        <Link className="btn btn-pri btn-lg w-full" href="/entrar">Entrar</Link>
      </div>
    );
  return (
    <form className="flex flex-col gap-6" onSubmit={salvar}>
      <div className="flex flex-col gap-3">
        <h1 className="t-h1 text-[38px] lg:text-[52px]">Criar senha</h1>
        <p className="text-muted">Escolha a senha da sua área de aluna.</p>
      </div>
      <div className="field"><label htmlFor="senha">Senha nova</label><input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required placeholder="Mínimo de 8 caracteres…" /></div>
      <div className="field"><label htmlFor="confirmar">Repita a senha</label><input id="confirmar" name="confirmar" type="password" autoComplete="new-password" minLength={8} required /></div>
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn btn-pri btn-lg w-full" type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar senha'}</button>
    </form>
  );
}
