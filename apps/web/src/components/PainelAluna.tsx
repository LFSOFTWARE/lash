'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { sairDaConta, useUsuaria } from './AppShell';
import { Icon } from './Icon';
import { Aviso, Carregando, NOME_FORMATO, dataCurta, iniciais, telefone, useDados } from './ui';
import { api, gravarSessao, lerSessao, textoErro } from '@/lib/api';
import { ehApostila, etiqueta, imagem, posicao } from '@/lib/catalogo';
import { wa } from '@/lib/site';
import type { ApiProduto, Pedido, Usuaria } from '@/lib/tipos';

const linkAula = (slug: string) => `/aluna/aula?curso=${slug}`;
const pagar = (titulo: string) => wa(`Olá, Camilla! Fiz o pedido de ${titulo} e quero combinar o pagamento.`);

export function PainelAluna() {
  const u = useUsuaria();
  const { dados, erro } = useDados(() => Promise.all([api<Pedido[]>('/aluna/pedidos'), api<ApiProduto[]>('/aluna/produtos')]));
  const primeiro = u.nome.split(' ')[0];

  if (erro) return <div className="px-5 pt-6 lg:px-12 lg:pt-10"><Aviso>{erro}</Aviso></div>;
  if (!dados) return <Carregando />;
  const [pedidos, liberados] = dados;

  const visiveis = pedidos.filter((e) => e.status !== 'cancelada' && e.produto);
  const cursos = visiveis.filter((e) => e.produto!.tipo === 'curso' || e.produto!.tipo === 'combo');
  const online = cursos.filter((e) => e.status === 'ativa' && !e.vencida && e.produto!.formato === 'online');
  const continuar = online.find((e) => e.progresso && e.progresso.percentual < 100) ?? online[0];
  const turmas = cursos.filter((e) => e.status === 'ativa' && e.produto!.formato === 'presencial');
  const apostilas = liberados.filter(ehApostila);
  const apostilasPendentes = visiveis.filter((e) => e.status === 'pendente' && ehApostila(e.produto!));
  const concluidos = online.filter((e) => e.progresso && e.progresso.percentual === 100);

  return (
    <div className="flex flex-col gap-8 px-5 pt-6 pb-10 lg:px-12 lg:pt-10 lg:pb-14">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col"><h1 className="t-h2">Olá, {primeiro}</h1><span className="text-muted">{continuar ? 'Continue de onde você parou.' : 'Seus cursos e materiais ficam aqui.'}</span></div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex flex-col items-end"><b className="text-sm">{u.nome}</b><span className="text-sm text-muted">Aluna</span></div>
          <div className="ini" aria-hidden="true">{iniciais(u.nome)}</div>
        </div>
      </div>

      {continuar && (
        <div className="card flex flex-col overflow-hidden lg:flex-row">
          <div className="photo dim h-[190px] flex-none rounded-none lg:h-[250px] lg:w-[380px]">
            <img src={imagem(continuar.produto!.capa)} alt="" width={681} height={1210} style={{ objectPosition: posicao(continuar.produto!.slug) }} />
            <Link className="play" href={linkAula(continuar.produto!.slug)} aria-label="Continuar a aula"><Icon name="play" size={20} /></Link>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 lg:p-8">
            <span className="t-label">Continuar assistindo · online</span>
            <h2 className="t-h3 lg:text-[34px]">{continuar.produto!.titulo}</h2>
            {continuar.progresso && (
              <div className="flex items-center gap-4">
                <Barra p={continuar.progresso.percentual} />
                <b className="num text-sm">{continuar.progresso.concluidas} de {continuar.progresso.total} aulas</b>
              </div>
            )}
            <Link className="btn btn-pri mt-1 lg:self-start" href={linkAula(continuar.produto!.slug)}><Icon name="play" size={16} />{continuar.progresso?.concluidas ? 'Continuar aula' : 'Começar o curso'}</Link>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="t-h3">Meus cursos</h2>
        {cursos.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            {cursos.map((e) => <CartaoCurso key={e.id} e={e} />)}
          </div>
        ) : (
          <div className="card flex flex-col items-start gap-3 p-5">
            <span className="text-muted">Você ainda não tem cursos.</span>
            <Link className="btn btn-sec" href="/cursos">Ver os cursos</Link>
          </div>
        )}
      </section>

      {turmas.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="t-h3">{turmas.length > 1 ? 'Turmas presenciais' : 'Turma presencial'}</h2>
          {turmas.map((e) => (
            <div key={e.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center lg:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="ficon"><Icon name="calendar" /></div>
                <div className="flex flex-col">
                  <b>{e.produto!.titulo}</b>
                  <span className="text-sm text-muted">{e.dataTurma ? `Sua turma: ${dataCurta(e.dataTurma)}, em Osasco-SP.` : 'A data é combinada com a Camilla pelo WhatsApp.'}</span>
                </div>
              </div>
              <a className="btn btn-sec" href={wa(`Olá, Camilla! Quero ${e.dataTurma ? 'confirmar' : 'combinar'} a data da minha turma de ${e.produto!.titulo}.`)}><Icon name="whatsapp" size={18} />{e.dataTurma ? 'Falar com a Camilla' : 'Combinar data'}</a>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="t-h3">Minhas apostilas</h2>
        {apostilas.map((p) => <Apostila key={p.id} p={p} />)}
        {apostilasPendentes.map((e) => (
          <div key={e.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center lg:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="ficon"><Icon name="file" /></div>
              <div className="flex min-w-0 flex-col"><b>{e.produto!.titulo}</b><span className="tag tag-warn mt-1 self-start"><Icon name="clock" size={14} />Aguardando confirmação</span></div>
            </div>
            <a className="btn btn-sec" href={pagar(e.produto!.titulo)}><Icon name="whatsapp" size={18} />Combinar pagamento</a>
          </div>
        ))}
        {!apostilas.length && !apostilasPendentes.length && (
          <div className="card flex flex-col items-start gap-3 p-5">
            <span className="text-muted">Nenhuma apostila por aqui ainda.</span>
            <Link className="btn btn-sec" href="/apostilas">Ver as apostilas</Link>
          </div>
        )}
      </section>

      <section id="certificados" className="flex scroll-mt-20 flex-col gap-4">
        <h2 className="t-h3">Certificados</h2>
        <p className="card p-5 text-muted">
          {concluidos.length
            ? `Parabéns! Você concluiu ${concluidos.map((e) => e.produto!.titulo).join(', ')}. Peça seu certificado à Camilla pelo WhatsApp.`
            : online.length
              ? 'Seu certificado aparece aqui quando você concluir todas as aulas do curso online.'
              : 'O certificado dos cursos presenciais é entregue no fim da turma.'}
        </p>
      </section>

      <Perfil u={u} />
    </div>
  );
}

function Barra({ p }: { p: number }) {
  return (
    <div className="bar flex-1" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do curso">
      <i style={{ '--p': p / 100 } as React.CSSProperties} />
    </div>
  );
}

function CartaoCurso({ e }: { e: Pedido }) {
  const p = e.produto!;
  const online = p.formato === 'online';
  const liberado = e.status === 'ativa' && !e.vencida;
  const corpo = (
    <>
      <div className="photo aspect-video rounded-none"><img src={imagem(p.capa)} alt="" width={681} height={1210} style={{ objectPosition: posicao(p.slug) }} /></div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {e.vencida ? (
          <span className="tag tag-err self-start">Acesso vencido</span>
        ) : liberado ? (
          <span className="tag tag-ok self-start"><Icon name="check" size={14} />Liberado{p.formato ? ` · ${NOME_FORMATO[p.formato].toLowerCase()}` : ''}</span>
        ) : (
          <span className="tag tag-warn self-start"><Icon name="clock" size={14} />Aguardando confirmação</span>
        )}
        <h3 className="t-h3">{p.titulo}</h3>
        {liberado && online && e.progresso && (
          <div className="flex items-center gap-3"><Barra p={e.progresso.percentual} /><span className="num text-sm">{e.progresso.percentual}%</span></div>
        )}
        {liberado && p.formato === 'presencial' && <span className="text-sm text-muted">{e.dataTurma ? `Turma em ${dataCurta(e.dataTurma)}` : 'Data da turma a combinar'}</span>}
        {!liberado && !e.vencida && <a className="go mt-auto self-start text-sm" href={pagar(p.titulo)}><Icon name="whatsapp" size={16} />Combinar pagamento</a>}
        {e.vencida && <a className="go mt-auto self-start text-sm" href={wa(`Olá, Camilla! Meu acesso a ${p.titulo} venceu. Como renovo?`)}><Icon name="whatsapp" size={16} />Renovar acesso</a>}
      </div>
    </>
  );
  return liberado && online ? (
    <Link className="card flex flex-col overflow-hidden" href={linkAula(p.slug)}>{corpo}</Link>
  ) : (
    <div className="card flex flex-col overflow-hidden">{corpo}</div>
  );
}

function Apostila({ p }: { p: ApiProduto }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  async function baixar() {
    setBaixando(true);
    setErro(null);
    try {
      const { url } = await api<{ url: string }>(`/aluna/produtos/${p.id}/download`);
      window.location.assign(url);
    } catch (e) {
      setErro(textoErro(e));
    }
    setBaixando(false);
  }
  return (
    <div className="card flex flex-col gap-3 p-4 lg:px-5">
      <div className="flex items-center gap-4">
        <div className="ficon"><Icon name="file" /></div>
        <div className="flex min-w-0 flex-1 flex-col"><b>{p.titulo}</b><span className="text-sm text-muted">{etiqueta(p)}</span></div>
        {p.temArquivo ? (
          <button className="btn btn-sec" type="button" onClick={baixar} disabled={baixando} aria-label={`Baixar ${p.titulo}`}><Icon name="download" size={18} /><span className="hidden sm:inline">{baixando ? 'Abrindo…' : 'Baixar'}</span></button>
        ) : (
          <span className="text-sm text-muted">Em breve</span>
        )}
      </div>
      {erro && <Aviso>{erro}</Aviso>}
    </div>
  );
}

function Perfil({ u }: { u: Usuaria }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState<'dados' | 'senha' | null>(null);
  const [msg, setMsg] = useState<{ onde: 'dados' | 'senha'; tipo: 'ok' | 'err'; texto: string } | null>(null);

  async function salvarDados(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSalvando('dados');
    try {
      const nova = await api<Usuaria>('/aluna/perfil', { metodo: 'PATCH', corpo: { nome: f.get('nome'), whatsapp: f.get('whatsapp') } });
      const s = lerSessao();
      if (s) gravarSessao({ ...s, usuaria: nova });
      setMsg({ onde: 'dados', tipo: 'ok', texto: 'Dados salvos.' });
    } catch (err) {
      setMsg({ onde: 'dados', tipo: 'err', texto: textoErro(err) });
    }
    setSalvando(null);
  }

  async function trocarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSalvando('senha');
    try {
      await api('/aluna/senha', { metodo: 'PUT', corpo: { senhaAtual: f.get('atual'), senhaNova: f.get('nova') } });
      // A API encerra todas as sessões ao trocar a senha: entra de novo com a senha nova.
      await sairDaConta(router);
    } catch (err) {
      setMsg({ onde: 'senha', tipo: 'err', texto: textoErro(err) });
      setSalvando(null);
    }
  }

  return (
    <section id="perfil" className="flex scroll-mt-20 flex-col gap-4">
      <h2 className="t-h3">Meu perfil</h2>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <form className="card flex flex-col gap-4 p-5 lg:p-6" onSubmit={salvarDados}>
          <b>Seus dados</b>
          <div className="field"><label htmlFor="p-nome">Nome</label><input id="p-nome" name="nome" type="text" autoComplete="name" required maxLength={120} defaultValue={u.nome} /></div>
          <div className="field"><label htmlFor="p-zap">WhatsApp</label><input id="p-zap" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required minLength={10} defaultValue={telefone(u.whatsapp)} /></div>
          <div className="field"><label htmlFor="p-email">E-mail</label><input id="p-email" type="email" value={u.email} readOnly disabled aria-describedby="p-email-dica" /><span id="p-email-dica" className="text-sm text-muted">Para trocar o e-mail, fale com a Camilla.</span></div>
          {msg?.onde === 'dados' && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
          <button className="btn btn-sec self-start" type="submit" disabled={salvando === 'dados'}>{salvando === 'dados' ? 'Salvando…' : 'Salvar dados'}</button>
        </form>
        <form className="card flex flex-col gap-4 p-5 lg:p-6" onSubmit={trocarSenha}>
          <b>Trocar a senha</b>
          <div className="field"><label htmlFor="p-atual">Senha atual</label><input id="p-atual" name="atual" type="password" autoComplete="current-password" required /></div>
          <div className="field"><label htmlFor="p-nova">Senha nova</label><input id="p-nova" name="nova" type="password" autoComplete="new-password" minLength={8} required placeholder="Mínimo de 8 caracteres…" /></div>
          {msg?.onde === 'senha' && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
          <button className="btn btn-sec self-start" type="submit" disabled={salvando === 'senha'}>{salvando === 'senha' ? 'Salvando…' : 'Trocar senha'}</button>
          <span className="text-sm text-muted">Depois de trocar, você entra de novo com a senha nova.</span>
        </form>
      </div>
    </section>
  );
}
