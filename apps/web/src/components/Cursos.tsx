'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icon';
import { Aviso, Carregando, Modal, NOME_FORMATO, centavos, paraInputReais, useDados } from './ui';
import { api, textoErro } from '@/lib/api';
import { cartao, ehApostila, imagem, invalidarCatalogo, linkProduto, posicao } from '@/lib/catalogo';
import type { ApiProduto, AulaAdmin, ModuloAdmin, Provedor } from '@/lib/tipos';
import { PrecoProduto } from './Produto';

const nome = (p: ApiProduto) => `${p.titulo}${p.formato ? ` — ${NOME_FORMATO[p.formato]}` : ''}`;

async function enviarArquivo(arquivo: File, publico: boolean) {
  const f = new FormData();
  f.append('arquivo', arquivo);
  if (publico) f.append('publico', 'true');
  return api<{ chave: string; url?: string }>('/admin/uploads', { metodo: 'POST', corpo: f });
}

/** Cursos e materiais: escolhe o produto, edita informações e preço e, no curso online, a grade de aulas. */
export function Cursos() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const lista = useDados(() => api<ApiProduto[]>('/admin/produtos'));
  const [novo, setNovo] = useState(false);
  const produtos = lista.dados;
  const atual = produtos?.find((p) => p.id === id) ?? produtos?.[0];
  const escolher = (pid: string) => router.replace(`/admin/curso?id=${pid}`);

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-10 lg:gap-8 lg:px-12 lg:pt-10 lg:pb-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <span className="t-label">Cursos e materiais</span>
          <h1 className="t-h2">{atual ? nome(atual) : 'Cursos e materiais'}</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="field sm:w-[320px]">
            <label htmlFor="produto" className="sr">Produto</label>
            <select id="produto" value={atual?.id ?? ''} onChange={(e) => escolher(e.target.value)} disabled={!produtos}>
              {produtos?.map((p) => <option key={p.id} value={p.id}>{nome(p)}{p.publicado ? '' : ' (rascunho)'}</option>)}
            </select>
          </div>
          <button className="btn btn-sec" type="button" onClick={() => setNovo(true)}><Icon name="plus" size={18} />Novo produto</button>
        </div>
      </div>

      {lista.erro ? (
        <Aviso>{lista.erro}</Aviso>
      ) : !produtos ? (
        <Carregando />
      ) : !atual ? (
        <p className="card p-8 text-center text-muted">Nenhum produto ainda. Crie o primeiro em “Novo produto”.</p>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <Informacoes
            key={atual.id}
            p={atual}
            salvo={(p) => {
              lista.setDados(produtos.map((x) => (x.id === p.id ? p : x)));
              invalidarCatalogo();
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {atual.tipo === 'curso' && atual.formato === 'online' ? (
              <Grade key={atual.id} cursoId={atual.id} />
            ) : (
              <div className="card flex flex-col gap-2 p-5">
                <b>{atual.tipo === 'curso' ? 'Curso presencial' : ehApostila(atual) ? 'Arquivo para download' : 'Combo'}</b>
                <span className="text-muted">
                  {atual.tipo === 'curso'
                    ? 'Não tem aulas gravadas. Ao liberar o acesso de uma aluna, você pode marcar a data da turma.'
                    : ehApostila(atual)
                      ? 'Envie o PDF no campo “Arquivo”. A aluna baixa pela área dela, com um link que vale 5 minutos.'
                      : 'Liberar um combo libera todos os itens dele.'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal aberto={novo} aoFechar={() => setNovo(false)} titulo="Novo produto">
        <NovoProduto
          criado={(p) => {
            lista.setDados([...(produtos ?? []), p]);
            setNovo(false);
            escolher(p.id);
          }}
        />
      </Modal>
    </div>
  );
}

function Informacoes({ p, salvo }: { p: ApiProduto; salvo: (p: ApiProduto) => void }) {
  const [f, setF] = useState({
    titulo: p.titulo,
    resumo: p.resumo ?? '',
    descricao: p.descricao ?? '',
    preco: paraInputReais(p.preco),
    precoOriginal: paraInputReais(p.precoOriginal),
    condicoes: p.condicoes ?? '',
    cargaHoraria: p.cargaHoraria ?? '',
    paginas: p.paginas ? String(p.paginas) : '',
    publicado: p.publicado,
    capa: p.capa,
    arquivo: undefined as string | undefined,
  });
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState<'salvar' | 'capa' | 'arquivo' | null>(null);
  const muda = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const preco = centavos(f.preco);
  const original = centavos(f.precoOriginal);
  const previa = preco !== null ? cartao({ ...p, preco, precoOriginal: original ?? undefined, desconto: original && original > preco ? Math.round((1 - preco / original) * 100) : undefined, condicoes: undefined }) : null;

  async function subir(e: React.ChangeEvent<HTMLInputElement>, publico: boolean) {
    const arq = e.target.files?.[0];
    e.target.value = '';
    if (!arq) return;
    setOcupado(publico ? 'capa' : 'arquivo');
    setMsg(null);
    try {
      const r = await enviarArquivo(arq, publico);
      setF((x) => (publico ? { ...x, capa: r.url ?? x.capa } : { ...x, arquivo: r.chave }));
      setMsg({ tipo: 'ok', texto: publico ? 'Capa enviada. Clique em “Salvar alterações” para usar.' : `“${arq.name}” enviado. Clique em “Salvar alterações” para usar.` });
    } catch (err) {
      setMsg({ tipo: 'err', texto: textoErro(err) });
    }
    setOcupado(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (preco === null) return setMsg({ tipo: 'err', texto: 'Informe o preço atual.' });
    setOcupado('salvar');
    setMsg(null);
    try {
      const corpo: Record<string, unknown> = {
        titulo: f.titulo,
        resumo: f.resumo,
        descricao: f.descricao,
        preco,
        precoOriginal: original,
        condicoes: f.condicoes || null,
        publicado: f.publicado,
        capa: f.capa,
      };
      if (p.tipo === 'curso') corpo.cargaHoraria = f.cargaHoraria || null;
      if (p.tipo === 'apostila') corpo.paginas = f.paginas ? Number(f.paginas) : null;
      if (f.arquivo) corpo.arquivo = f.arquivo;
      salvo(await api<ApiProduto>(`/admin/produtos/${p.id}`, { metodo: 'PATCH', corpo }));
      setMsg({ tipo: 'ok', texto: 'Alterações salvas.' });
    } catch (err) {
      setMsg({ tipo: 'err', texto: textoErro(err) });
    }
    setOcupado(null);
  }

  return (
    <form className="card flex flex-col gap-4 p-5 lg:w-[440px] lg:flex-none lg:p-7" onSubmit={salvar}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="t-h3">Informações</h2>
        {p.publicado && <Link className="go text-sm" href={linkProduto(p)}><Icon name="eye" size={16} />Ver página</Link>}
      </div>
      <div className="photo h-[180px]"><img src={imagem(f.capa)} alt="Capa atual" width={681} height={1210} style={{ objectPosition: posicao(p.slug) }} /></div>
      <label className={`btn btn-sec self-start ${ocupado === 'capa' ? 'opacity-50' : 'cursor-pointer'}`}>
        <Icon name="image" size={18} />{ocupado === 'capa' ? 'Enviando…' : 'Trocar capa'}
        <input className="sr" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => subir(e, true)} disabled={ocupado !== null} />
      </label>
      <div className="field"><label htmlFor="titulo">Título</label><input id="titulo" type="text" autoComplete="off" required maxLength={160} value={f.titulo} onChange={muda('titulo')} /></div>
      <div className="field"><label htmlFor="resumo">Resumo <span className="font-normal text-muted">(aparece no cartão do catálogo)</span></label><textarea id="resumo" maxLength={400} value={f.resumo} onChange={muda('resumo')} /></div>
      <div className="flex gap-3">
        <div className="field flex-1"><label htmlFor="preco">Preço atual</label><input id="preco" type="text" inputMode="decimal" autoComplete="off" required placeholder="0,00" value={f.preco} onChange={muda('preco')} /></div>
        <div className="field flex-1"><label htmlFor="preco-de">Preço original <span className="font-normal text-muted">(opcional)</span></label><input id="preco-de" type="text" inputMode="decimal" autoComplete="off" placeholder="0,00" value={f.precoOriginal} onChange={muda('precoOriginal')} aria-describedby="preco-dica" /></div>
      </div>
      <div id="preco-dica" className="flex flex-col gap-2 rounded-xl bg-bg px-4 py-3.5">
        <span className="t-label">Como aparece no site</span>
        {previa ? <PrecoProduto p={previa} size={22} /> : <span className="text-muted">Informe o preço atual.</span>}
        <span className="text-sm text-muted">Deixe o preço original em branco para mostrar só o preço atual.</span>
      </div>
      <div className="field"><label htmlFor="condicoes">Condições de pagamento</label><input id="condicoes" type="text" autoComplete="off" maxLength={120} placeholder="à vista ou em até 12x" value={f.condicoes} onChange={muda('condicoes')} /></div>
      {p.tipo === 'curso' && <div className="field"><label htmlFor="carga">Duração</label><input id="carga" type="text" autoComplete="off" maxLength={60} placeholder={p.formato === 'online' ? '12 aulas' : '2 dias'} value={f.cargaHoraria} onChange={muda('cargaHoraria')} /></div>}
      {p.tipo === 'apostila' && <div className="field"><label htmlFor="paginas">Páginas</label><input id="paginas" type="number" min={1} inputMode="numeric" value={f.paginas} onChange={muda('paginas')} /></div>}
      {ehApostila(p) && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Arquivo</span>
          <div className="flex flex-wrap items-center gap-3">
            {f.arquivo || p.temArquivo ? <span className="tag tag-ok"><Icon name="check" size={14} />{f.arquivo ? 'Novo arquivo pronto' : 'Arquivo enviado'}</span> : <span className="tag tag-warn">Sem arquivo</span>}
            <label className={`btn btn-sec ${ocupado === 'arquivo' ? 'opacity-50' : 'cursor-pointer'}`}>
              <Icon name="file" size={18} />{ocupado === 'arquivo' ? 'Enviando…' : p.temArquivo ? 'Trocar PDF' : 'Enviar PDF'}
              <input className="sr" type="file" accept="application/pdf,.xlsx,.xls,.zip" onChange={(e) => subir(e, false)} disabled={ocupado !== null} />
            </label>
          </div>
        </div>
      )}
      <div className="field"><label htmlFor="descricao">Descrição</label><textarea id="descricao" maxLength={20000} value={f.descricao} onChange={muda('descricao')} /></div>
      <label className="chk"><input type="checkbox" checked={f.publicado} onChange={(e) => setF({ ...f, publicado: e.target.checked })} />Publicado no site</label>
      {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
      <button className="btn btn-pri" type="submit" disabled={ocupado !== null}>{ocupado === 'salvar' ? 'Salvando…' : 'Salvar alterações'}</button>
    </form>
  );
}

function NovoProduto({ criado }: { criado: (p: ApiProduto) => void }) {
  const [tipo, setTipo] = useState<'curso-presencial' | 'curso-online' | 'apostila'>('curso-presencial');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const preco = centavos(f.preco);
    if (preco === null) return setErro('Informe o preço.');
    setEnviando(true);
    setErro(null);
    try {
      const [t, formato] = tipo.split('-');
      const p = await api<ApiProduto>('/admin/produtos', {
        metodo: 'POST',
        corpo: { tipo: t, ...(formato ? { formato } : {}), titulo: f.titulo, categoria: f.categoria, preco, publicado: false },
      });
      criado(p);
    } catch (err) {
      setErro(textoErro(err));
      setEnviando(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar}>
      <div className="seg" role="group" aria-label="Tipo">
        {(
          [
            ['curso-presencial', 'Presencial'],
            ['curso-online', 'Online'],
            ['apostila', 'Apostila'],
          ] as const
        ).map(([v, t]) => (
          <button key={v} type="button" aria-pressed={tipo === v} onClick={() => setTipo(v)}>{t}</button>
        ))}
      </div>
      <div className="field"><label htmlFor="n-titulo">Título</label><input id="n-titulo" name="titulo" type="text" required maxLength={160} autoComplete="off" /></div>
      <div className="flex gap-3">
        <div className="field flex-1">
          <label htmlFor="n-cat">Área</label>
          <select id="n-cat" name="categoria" defaultValue="cilios"><option value="cilios">Cílios</option><option value="sobrancelhas">Sobrancelhas</option></select>
        </div>
        <div className="field flex-1"><label htmlFor="n-preco">Preço</label><input id="n-preco" name="preco" type="text" inputMode="decimal" required placeholder="0,00" autoComplete="off" /></div>
      </div>
      <p className="text-sm text-muted">O produto começa como rascunho. Complete as informações e marque “Publicado no site” quando estiver pronto.</p>
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn btn-pri btn-lg" type="submit" disabled={enviando}>{enviando ? 'Criando…' : 'Criar produto'}</button>
    </form>
  );
}

/** Grade do curso online: módulos e aulas, com vídeo e materiais. */
function Grade({ cursoId }: { cursoId: string }) {
  const { dados: modulos, erro, recarregar } = useDados(() => api<ModuloAdmin[]>(`/admin/produtos/${cursoId}/modulos`), [cursoId]);
  const [editando, setEditando] = useState<{ moduloId: string; aula?: AulaAdmin } | null>(null);
  const [falha, setFalha] = useState<string | null>(null);

  async function acao(f: () => Promise<unknown>) {
    setFalha(null);
    try {
      await f();
      recarregar();
    } catch (e) {
      setFalha(textoErro(e));
    }
  }
  const novoModulo = () => {
    const titulo = prompt('Nome do módulo');
    if (titulo?.trim()) acao(() => api(`/admin/produtos/${cursoId}/modulos`, { metodo: 'POST', corpo: { titulo: titulo.trim() } }));
  };
  const renomear = (m: ModuloAdmin) => {
    const titulo = prompt('Nome do módulo', m.titulo);
    if (titulo?.trim() && titulo.trim() !== m.titulo) acao(() => api(`/admin/modulos/${m.id}`, { metodo: 'PATCH', corpo: { titulo: titulo.trim() } }));
  };
  const apagarModulo = (m: ModuloAdmin) => confirm(`Apagar o módulo “${m.titulo}”?`) && acao(() => api(`/admin/modulos/${m.id}`, { metodo: 'DELETE' }));
  const apagarAula = (a: AulaAdmin) => confirm(`Apagar a aula “${a.titulo}”? O progresso das alunas nela também é apagado.`) && acao(() => api(`/admin/aulas/${a.id}`, { metodo: 'DELETE' }));
  const mover = (m: ModuloAdmin, i: number, d: -1 | 1) => {
    const ids = m.aulas.map((a) => a.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    acao(() => api(`/admin/modulos/${m.id}/aulas/ordem`, { metodo: 'PUT', corpo: { ids } }));
  };

  return (
    <>
      <div className="flex items-center justify-between"><h2 className="t-h3">Módulos e aulas</h2><button className="btn btn-sec" type="button" onClick={novoModulo}><Icon name="plus" size={18} />Novo módulo</button></div>
      {(erro || falha) && <Aviso>{erro ?? falha}</Aviso>}
      {!modulos ? (
        !erro && <Carregando />
      ) : !modulos.length ? (
        <p className="card p-6 text-muted">Nenhum módulo ainda. Comece por “Novo módulo”.</p>
      ) : (
        modulos.map((m) => (
          <div key={m.id} className="card flex flex-col gap-2 p-3 lg:p-4">
            <div className="flex items-center justify-between gap-2 p-2">
              <b className="min-w-0 truncate">{m.titulo}</b>
              <div className="flex flex-none items-center gap-1">
                <span className="mr-2 text-sm text-muted">{m.aulas.length} {m.aulas.length === 1 ? 'aula' : 'aulas'}</span>
                <button className="icb h-9 w-9 text-muted" type="button" onClick={() => renomear(m)} aria-label={`Renomear ${m.titulo}`}><Icon name="pencil" size={18} /></button>
                <button className="icb h-9 w-9 text-muted" type="button" onClick={() => apagarModulo(m)} aria-label={`Apagar ${m.titulo}`}><Icon name="trash" size={18} /></button>
              </div>
            </div>
            {m.aulas.map((a, i) => (
              <div key={a.id} className="lesson flex-wrap bg-bg !py-2 sm:flex-nowrap">
                <span className="min-w-0 flex-1">{a.titulo}{a.aulaGratis && <span className="tag ml-2">Grátis</span>}</span>
                {a.videoId ? <span className="flex items-center gap-2 text-sm text-muted"><Icon name="video" size={16} /><span>Vídeo</span></span> : <span className="tag tag-warn">Sem vídeo</span>}
                {a.materiais.length > 0 && <span className="flex items-center gap-1 text-sm text-muted"><Icon name="file" size={16} />{a.materiais.length}</span>}
                <div className="flex items-center">
                  <button className="icb h-9 w-9 text-muted disabled:opacity-30" type="button" disabled={i === 0} onClick={() => mover(m, i, -1)} aria-label={`Subir ${a.titulo}`}><Icon name="chevron" size={18} className="rotate-180" /></button>
                  <button className="icb h-9 w-9 text-muted disabled:opacity-30" type="button" disabled={i === m.aulas.length - 1} onClick={() => mover(m, i, 1)} aria-label={`Descer ${a.titulo}`}><Icon name="chevron" size={18} /></button>
                  <button className="icb h-9 w-9 text-muted" type="button" onClick={() => setEditando({ moduloId: m.id, aula: a })} aria-label={`Editar ${a.titulo}`}><Icon name="pencil" size={18} /></button>
                  <button className="icb h-9 w-9 text-muted" type="button" onClick={() => apagarAula(a)} aria-label={`Apagar ${a.titulo}`}><Icon name="trash" size={18} /></button>
                </div>
              </div>
            ))}
            <button className="lesson dash" type="button" onClick={() => setEditando({ moduloId: m.id })}><Icon name="plus" size={18} />Adicionar aula</button>
          </div>
        ))
      )}
      <Modal aberto={Boolean(editando)} aoFechar={() => setEditando(null)} titulo={editando?.aula ? 'Editar aula' : 'Nova aula'}>
        {editando && (
          <FormAula
            moduloId={editando.moduloId}
            aula={editando.aula}
            pronto={() => {
              setEditando(null);
              recarregar();
            }}
          />
        )}
      </Modal>
    </>
  );
}

const PROVEDORES: [Provedor | '', string][] = [['bunny', 'Bunny Stream (recomendado)'], ['vimeo', 'Vimeo'], ['youtube', 'YouTube (não listado)'], ['', 'Sem vídeo por enquanto']];

function FormAula({ moduloId, aula, pronto }: { moduloId: string; aula?: AulaAdmin; pronto: () => void }) {
  const [provedor, setProvedor] = useState<Provedor | ''>(aula?.videoProvider ?? (aula ? '' : 'bunny'));
  const [materiais, setMateriais] = useState(aula?.materiais ?? []);
  const [ocupado, setOcupado] = useState<'salvar' | 'arquivo' | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function anexar(e: React.ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    e.target.value = '';
    if (!arq) return;
    setOcupado('arquivo');
    setErro(null);
    try {
      const r = await enviarArquivo(arq, false);
      setMateriais((m) => [...m, { nome: arq.name.replace(/\.[^.]+$/, ''), arquivo: r.chave }]);
    } catch (err) {
      setErro(textoErro(err));
    }
    setOcupado(null);
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setOcupado('salvar');
    setErro(null);
    const minutos = Number(f.duracao);
    const corpo = {
      titulo: f.titulo,
      descricao: f.descricao,
      videoProvider: provedor || (aula ? null : undefined),
      videoId: provedor ? f.videoId.trim() : aula ? null : undefined,
      duracao: f.duracao && minutos > 0 ? Math.round(minutos * 60) : undefined,
      aulaGratis: f.aulaGratis === 'on',
      materiais,
    };
    try {
      if (aula) await api(`/admin/aulas/${aula.id}`, { metodo: 'PATCH', corpo });
      else await api(`/admin/modulos/${moduloId}/aulas`, { metodo: 'POST', corpo });
      pronto();
    } catch (err) {
      setErro(textoErro(err));
      setOcupado(null);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={salvar}>
      <div className="field"><label htmlFor="a-titulo">Título</label><input id="a-titulo" name="titulo" type="text" required maxLength={160} autoComplete="off" defaultValue={aula?.titulo} /></div>
      <div className="field"><label htmlFor="a-desc">Descrição <span className="font-normal text-muted">(opcional)</span></label><textarea id="a-desc" name="descricao" maxLength={5000} defaultValue={aula?.descricao} /></div>
      <div className="field">
        <label htmlFor="a-prov">Vídeo</label>
        <select id="a-prov" value={provedor} onChange={(e) => setProvedor(e.target.value as Provedor | '')}>
          {PROVEDORES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </div>
      {provedor && (
        <div className="field">
          <label htmlFor="a-video">ID do vídeo</label>
          <input id="a-video" name="videoId" type="text" required maxLength={200} autoComplete="off" spellCheck={false} defaultValue={aula?.videoId} aria-describedby="a-video-dica" />
          <span id="a-video-dica" className="text-sm text-muted">
            {provedor === 'bunny' ? 'O código do vídeo na biblioteca do Bunny (ex.: 3f2a…-…).' : provedor === 'vimeo' ? 'O número no fim do link do Vimeo.' : 'O código depois de “v=” no link do YouTube.'}
          </span>
        </div>
      )}
      <div className="field sm:w-[200px]"><label htmlFor="a-dur">Duração (minutos)</label><input id="a-dur" name="duracao" type="number" min={0} step="any" inputMode="decimal" defaultValue={aula?.duracao ? Math.round(aula.duracao / 60) : ''} /></div>
      <label className="chk"><input type="checkbox" name="aulaGratis" defaultChecked={aula?.aulaGratis} />Aula grátis (qualquer pessoa pode assistir)</label>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Materiais</span>
        {materiais.map((m, i) => (
          <div key={m.arquivo + i} className="flex items-center gap-2 rounded-xl bg-bg py-1 pr-1 pl-4">
            <Icon name="file" size={16} className="text-muted" />
            <input className="h-10 min-w-0 flex-1 bg-transparent" aria-label="Nome do material" value={m.nome} maxLength={160} onChange={(e) => setMateriais(materiais.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))} />
            <button className="icb h-10 w-10 text-muted" type="button" onClick={() => setMateriais(materiais.filter((_, j) => j !== i))} aria-label={`Remover ${m.nome}`}><Icon name="trash" size={18} /></button>
          </div>
        ))}
        <label className={`btn btn-sec self-start ${ocupado === 'arquivo' ? 'opacity-50' : 'cursor-pointer'}`}>
          <Icon name="plus" size={18} />{ocupado === 'arquivo' ? 'Enviando…' : 'Anexar arquivo'}
          <input className="sr" type="file" onChange={anexar} disabled={ocupado !== null} />
        </label>
      </div>
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn btn-pri btn-lg" type="submit" disabled={ocupado !== null}>{ocupado === 'salvar' ? 'Salvando…' : 'Salvar aula'}</button>
    </form>
  );
}

