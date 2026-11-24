'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAcesso } from './AppShell';
import { Icon } from './Icon';
import { Aviso, Carregando, iniciais, useDados } from './ui';
import { ApiErro, api, textoErro } from '@/lib/api';
import { imagem, posicao } from '@/lib/catalogo';
import { wa } from '@/lib/site';
import type { CursoAluna } from '@/lib/tipos';

type Player = { aulaId: string; titulo: string; provedor: string; embedUrl: string };

/** Sala de aula: player, materiais e a grade do curso. URL: /aluna/aula?curso=slug&aula=id */
export function Aula() {
  const u = useAcesso('aluna');
  const q = useSearchParams();
  const router = useRouter();
  const slug = q.get('curso') ?? 'extensao-de-cilios-online';
  const { dados: curso, erro, setDados } = useDados(() => (u ? api<CursoAluna>(`/aluna/cursos/${slug}`) : new Promise<never>(() => {})), [slug, Boolean(u)]);
  const aulaId = q.get('aula') ?? curso?.proximaAulaId ?? null;
  const [marcando, setMarcando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const todas = curso?.modulos.flatMap((m) => m.aulas.map((a) => ({ ...a, modulo: m.titulo }))) ?? [];
  const i = todas.findIndex((a) => a.id === aulaId);
  const aula = todas[i];
  const anterior = todas[i - 1];
  const proxima = todas[i + 1];
  const ir = (id: string) => router.push(`/aluna/aula?curso=${slug}&aula=${id}`);

  useEffect(() => {
    if (aula) document.title = `${aula.titulo} · Camilla Lash`;
  }, [aula]);

  async function concluir(concluida: boolean) {
    if (!curso || !aula) return;
    setMarcando(true);
    setErroAcao(null);
    try {
      await api(`/aluna/progresso/${aula.id}`, { metodo: 'PUT', corpo: { concluida } });
      const modulos = curso.modulos.map((m) => ({ ...m, aulas: m.aulas.map((a) => (a.id === aula.id ? { ...a, concluida } : a)) }));
      const feitas = modulos.flatMap((m) => m.aulas).filter((a) => a.concluida).length;
      setDados({ ...curso, modulos, progresso: { ...curso.progresso, concluidas: feitas, percentual: Math.round((feitas / curso.progresso.total) * 100) } });
      if (concluida && proxima) ir(proxima.id);
    } catch (e) {
      setErroAcao(textoErro(e));
    }
    setMarcando(false);
  }

  const titulo = curso?.produto.titulo ?? 'Curso';
  const p = curso?.progresso;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-line bg-white px-5 lg:h-[72px] lg:px-10">
        <div className="flex min-w-0 items-center gap-6">
          <Link className="go text-muted" href="/aluna"><Icon name="arrow-left" size={18} /><span className="hidden sm:inline">Meus cursos</span><span className="sr sm:hidden">Meus cursos</span></Link>
          <b className="truncate">{titulo}</b>
        </div>
        {p && (
          <div className="flex flex-none items-center gap-4 lg:w-[340px]">
            <div className="bar hidden flex-1 lg:block" role="progressbar" aria-valuenow={p.percentual} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do curso"><i style={{ '--p': p.percentual / 100 } as React.CSSProperties} /></div>
            <span className="num text-sm">{p.concluidas} de {p.total}</span>
            {u && <div className="ini hidden lg:flex" aria-hidden="true">{iniciais(u.nome)}</div>}
          </div>
        )}
      </header>

      {erro ? (
        <div className="wrap flex flex-col gap-4 py-10">
          <Aviso>{erro}</Aviso>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-sec" href="/aluna">Voltar para meus cursos</Link>
            <a className="btn btn-pri" href={wa('Olá, Camilla! Não consigo abrir as aulas do curso online.')}><Icon name="whatsapp" size={18} />Falar com a Camilla</a>
          </div>
        </div>
      ) : !curso ? (
        <Carregando />
      ) : !aula ? (
        <div className="wrap py-10"><Aviso tipo="info">Este curso ainda não tem aulas. A Camilla avisa quando estiverem prontas.</Aviso></div>
      ) : (
        <div className="lg:flex lg:items-stretch">
          <main id="conteudo" className="flex min-w-0 flex-1 flex-col gap-6 lg:px-12 lg:pt-10 lg:pb-16">
            <Video key={aula.id} aulaId={aula.id} capa={imagem(curso.produto.capa)} pos={posicao(curso.produto.slug)} />
            <div className="flex flex-col gap-6 px-5 lg:px-0">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                <div className="flex flex-col gap-2"><span className="t-label">{aula.modulo} · Aula {i + 1} de {todas.length}</span><h1 className="t-h2">{aula.titulo}</h1></div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  {anterior && <button className="btn btn-sec" type="button" onClick={() => ir(anterior.id)}><Icon name="arrow-left" size={18} />Anterior</button>}
                  {aula.concluida ? (
                    <>
                      <button className="btn btn-sec" type="button" onClick={() => concluir(false)} disabled={marcando}><Icon name="check" size={18} />Concluída</button>
                      {proxima && <button className="btn btn-pri" type="button" onClick={() => ir(proxima.id)}>Próxima aula<Icon name="arrow-right" size={18} /></button>}
                    </>
                  ) : (
                    <button className="btn btn-pri sm:flex-1 lg:flex-none" type="button" onClick={() => concluir(true)} disabled={marcando}><Icon name="check" size={18} />{marcando ? 'Salvando…' : 'Marcar como concluída'}</button>
                  )}
                </div>
              </div>
              {erroAcao && <Aviso>{erroAcao}</Aviso>}
              {aula.descricao && <p className="max-w-[62ch] whitespace-pre-line text-muted">{aula.descricao}</p>}
              {aula.materiais.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="t-h3">Materiais da aula</h2>
                  {aula.materiais.map((nome, n) => <Material key={n} aulaId={aula.id} indice={n} nome={nome} />)}
                </div>
              )}
            </div>
          </main>
          <nav className="mt-8 flex flex-col border-t border-line bg-white px-1 pt-1 pb-5 lg:mt-0 lg:w-[400px] lg:flex-none lg:border-t-0 lg:border-l lg:px-4 lg:py-6" aria-label="Conteúdo do curso">
            <b className="hidden px-4 text-[17px] lg:block">Conteúdo do curso</b>
            {curso.modulos.map((m) => (
              <div key={m.id} className="flex flex-col">
                <div className="mod">{m.titulo}</div>
                {m.aulas.map((a) => (
                  <Link key={a.id} className="lesson" href={`/aluna/aula?curso=${slug}&aula=${a.id}`} aria-current={a.id === aula.id ? 'true' : undefined}>
                    <span className={`dot ${a.concluida ? 'dot-done' : ''}`}>{a.concluida && <Icon name="check" size={14} />}</span>
                    {a.titulo}
                    {a.concluida && <span className="sr"> (concluída)</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

function Video({ aulaId, capa, pos }: { aulaId: string; capa: string; pos: string }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    api<Player>(`/aulas/${aulaId}/video`)
      .then((r) => vivo && setPlayer(r))
      .catch((e) => vivo && setAviso(e instanceof ApiErro && e.status === 404 ? e.message : textoErro(e)));
    return () => {
      vivo = false;
    };
  }, [aulaId]);
  if (player)
    return (
      <div className="aspect-video w-full overflow-hidden bg-ink lg:rounded-[20px]">
        <iframe className="h-full w-full" src={player.embedUrl} title={player.titulo} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    );
  return (
    <div className="photo dim aspect-video rounded-none lg:rounded-[20px]">
      <img src={capa} alt="" width={480} height={640} style={{ objectPosition: pos }} />
      <div className="absolute inset-0 z-[1] flex items-center justify-center p-6 text-center text-white">
        {aviso ? <span className="max-w-[40ch] text-[15px]">{aviso}</span> : <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Carregando vídeo" />}
      </div>
    </div>
  );
}

function Material({ aulaId, indice, nome }: { aulaId: string; indice: number; nome: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState(false);
  async function baixar() {
    setAbrindo(true);
    setErro(null);
    try {
      const { url } = await api<{ url: string }>(`/aluna/aulas/${aulaId}/materiais/${indice}`);
      window.location.assign(url);
    } catch (e) {
      setErro(textoErro(e));
    }
    setAbrindo(false);
  }
  return (
    <div className="card flex flex-col gap-3 p-4 lg:px-5">
      <div className="flex items-center gap-4">
        <div className="ficon"><Icon name="file" /></div>
        <div className="flex min-w-0 flex-1 flex-col"><b>{nome}</b></div>
        <button className="btn btn-sec" type="button" onClick={baixar} disabled={abrindo} aria-label={`Baixar ${nome}`}><Icon name="download" size={18} /><span className="hidden sm:inline">{abrindo ? 'Abrindo…' : 'Baixar'}</span></button>
      </div>
      {erro && <Aviso>{erro}</Aviso>}
    </div>
  );
}
