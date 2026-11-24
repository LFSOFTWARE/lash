'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { textoErro } from '@/lib/api';

/** Janela sobre a página (dialog nativo: Esc fecha, foco preso dentro). */
export function Modal({ aberto, aoFechar, titulo, children }: { aberto: boolean; aoFechar: () => void; titulo: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  return (
    <dialog ref={ref} className="modal" onClose={aoFechar} aria-labelledby="modal-titulo">
      {aberto && (
        <div className="flex flex-col gap-5 p-5 lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id="modal-titulo" className="t-h3">{titulo}</h2>
            <button className="icb -mt-3 -mr-3" type="button" onClick={aoFechar} aria-label="Fechar"><Icon name="x" /></button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Aviso({ tipo = 'err', children }: { tipo?: 'err' | 'ok' | 'info'; children: React.ReactNode }) {
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === 'err' ? 'alert' : 'status'}>
      <Icon name={tipo === 'ok' ? 'check' : tipo === 'err' ? 'x' : 'clock'} size={18} className="mt-0.5" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="flex items-center gap-3 p-6 text-muted" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      {texto}
    </div>
  );
}

/** Carrega dados ao abrir a tela e quando `deps` mudam; `recarregar` refaz a busca. */
export function useDados<T>(buscar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    let vivo = true;
    setErro(null);
    buscar()
      .then((d) => vivo && setDados(d))
      .catch((e) => vivo && setErro(textoErro(e)));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao]);
  return { dados, erro, setDados, recarregar: () => setVersao((v) => v + 1) };
}

// ---------- Formatos ----------

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', ...o });
const DIA = fmt({ day: 'numeric', month: 'short' });
const DIA_ANO = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const HORA = fmt({ hour: '2-digit', minute: '2-digit' });
const CHAVE = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' });

/** "Hoje, 14:20", "Ontem, 19:42" ou "9 de nov., 16:30". */
export function quando(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const hoje = CHAVE.format(new Date());
  const ontem = CHAVE.format(new Date(Date.now() - 86_400_000));
  const dia = CHAVE.format(d) === hoje ? 'Hoje' : CHAVE.format(d) === ontem ? 'Ontem' : DIA.format(d);
  return `${dia}, ${HORA.format(d)}`;
}

/** Data de calendário (turma, validade): guardada como meia-noite UTC, mostrada sem fuso. */
export const dataCurta = (iso?: string) => (iso ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '');
export const dataLonga = (iso?: string) => (iso ? DIA_ANO.format(new Date(iso)) : '');
/** Valor para <input type="date"> a partir do ISO da API. */
export const paraInputData = (iso?: string) => (iso ? iso.slice(0, 10) : '');

export const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('')
    .toUpperCase();

/** (11) 94769-2668 */
export function telefone(n: string) {
  const d = n.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return n;
}

/** "R$ 1.000,00" ou "1000" → centavos. Vazio → null. */
export function centavos(texto: string): number | null {
  const t = texto.replace(/[^\d,.]/g, '');
  if (!t) return null;
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/\.(?=\d{3}(\D|$))/g, '');
  const v = Number(normal);
  return Number.isFinite(v) ? Math.round(v * 100) : null;
}
export const paraInputReais = (c?: number) => (c === undefined || c === null ? '' : (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export const NOME_FORMATO = { presencial: 'Presencial', online: 'Online' } as const;
