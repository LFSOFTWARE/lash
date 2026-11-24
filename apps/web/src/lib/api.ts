// Cliente da API (NestJS). Sem NEXT_PUBLIC_API_URL, o site roda em modo de exemplo:
// as mesmas telas, com os dados de lib/demo.ts guardados na memória da página.
import { useEffect, useState } from 'react';
import { demo } from './demo';
import { ApiErro } from './erro';
import type { Usuaria } from './tipos';

export { ApiErro };

/** Endereço da API, com o /api no fim. Ex.: http://localhost:3333/api */
export const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
export const usaApi = Boolean(API);

// ---------- Sessão ----------
// Tokens no localStorage e enviados como Bearer: funciona com front e API em domínios
// diferentes (GitHub Pages + Railway), onde os navegadores bloqueiam cookies de terceiros.

export type Sessao = { usuaria: Usuaria; accessToken?: string; refreshToken?: string };
const CHAVE = 'lash.sessao';
const ouvintes = new Set<() => void>();
let atual: Sessao | null | undefined;

export function lerSessao(): Sessao | null {
  if (atual !== undefined) return atual;
  if (typeof window === 'undefined') return null;
  try {
    atual = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
  } catch {
    atual = null;
  }
  return atual ?? null;
}

export function gravarSessao(s: Sessao | null) {
  atual = s;
  try {
    if (s) localStorage.setItem(CHAVE, JSON.stringify(s));
    else localStorage.removeItem(CHAVE);
  } catch {
    // Navegação privada sem storage: a sessão vale só nesta aba.
  }
  ouvintes.forEach((f) => f());
}

export function ouvirSessao(f: () => void) {
  ouvintes.add(f);
  return () => void ouvintes.delete(f);
}

export async function sair() {
  if (lerSessao()) await api('/auth/logout', { metodo: 'POST' }).catch(() => undefined);
  gravarSessao(null);
}

// ---------- Requisições ----------

type Opcoes = { metodo?: string; corpo?: unknown };

export async function api<T = unknown>(caminho: string, { metodo = 'GET', corpo }: Opcoes = {}): Promise<T> {
  if (!usaApi) return demo<T>(metodo, caminho, corpo, lerSessao()?.usuaria);
  let r = await enviar(caminho, metodo, corpo);
  if (r.status === 401 && lerSessao()?.refreshToken && !caminho.startsWith('/auth/')) {
    if (await renovar()) r = await enviar(caminho, metodo, corpo);
    else gravarSessao(null);
  }
  if (r.status === 204) return undefined as T;
  const dados = await r.json().catch(() => null);
  if (!r.ok) throw new ApiErro(r.status, mensagemDeErro(r.status, dados));
  return dados as T;
}

async function enviar(caminho: string, metodo: string, corpo: unknown) {
  const headers: Record<string, string> = {};
  const token = lerSessao()?.accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;
  const form = typeof FormData !== 'undefined' && corpo instanceof FormData;
  if (corpo !== undefined && !form) headers['Content-Type'] = 'application/json';
  try {
    return await fetch(API + caminho, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : form ? (corpo as FormData) : JSON.stringify(corpo),
      credentials: 'omit',
    });
  } catch {
    throw new ApiErro(0, 'Não foi possível falar com o servidor. Confira sua internet e tente de novo.');
  }
}

let renovando: Promise<boolean> | null = null;
function renovar() {
  renovando ??= (async () => {
    try {
      const r = await enviar('/auth/refresh', 'POST', { refreshToken: lerSessao()?.refreshToken });
      if (!r.ok) return false;
      gravarSessao(await r.json());
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => (renovando = null));
    }
  })();
  return renovando;
}

function mensagemDeErro(status: number, dados: { message?: string | string[] } | null) {
  const m = dados?.message;
  if (Array.isArray(m) && m.length) return m.join(' ');
  if (typeof m === 'string' && status < 500) return m;
  if (status === 429) return 'Muitas tentativas. Espere um minuto e tente de novo.';
  return 'Algo deu errado do nosso lado. Tente de novo em instantes.';
}

export const textoErro = (e: unknown) => (e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.');

/** Sessão atual; `undefined` enquanto ainda não leu o localStorage (primeira renderização). */
export function useSessao() {
  const [s, setS] = useState<Sessao | null | undefined>(undefined);
  useEffect(() => {
    setS(lerSessao());
    return ouvirSessao(() => setS(lerSessao()));
  }, []);
  return s;
}
