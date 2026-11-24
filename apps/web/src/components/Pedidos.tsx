'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { Aviso, Carregando, Modal, NOME_FORMATO, dataCurta, iniciais, quando, telefone, useDados } from './ui';
import { api, textoErro } from '@/lib/api';
import { reais } from '@/lib/catalogo';
import { caminho, wa } from '@/lib/site';
import type { AlunaAdmin, ApiProduto, Pagina, PedidoAdmin, Resumo, Status } from '@/lib/tipos';

const FILTROS: [string, Status | ''][] = [['Pendentes', 'pendente'], ['Liberados', 'ativa'], ['Cancelados', 'cancelada'], ['Todos', '']];
const POR_PAGINA = 20;

const nomeItem = (e: PedidoAdmin) => `${e.produto?.titulo ?? 'Produto removido'}${e.produto?.formato ? ` — ${NOME_FORMATO[e.produto.formato]}` : ''}`;
const linkEntrar = () => `${location.origin}${caminho('/entrar')}`;
const avisoLiberado = (nome: string, item: string, whatsapp: string) =>
  wa(`Oi, ${nome.split(' ')[0]}! Seu acesso a ${item} foi liberado. Entre na área da aluna: ${linkEntrar()}`, whatsapp);

/** Painel: números do topo, pedidos com filtros e as ações de liberar e cancelar. */
export function Pedidos() {
  const [status, setStatus] = useState<Status | ''>('pendente');
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [paginas, setPaginas] = useState(1);
  const [liberando, setLiberando] = useState<PedidoAdmin | null>(null);
  const [manual, setManual] = useState(false);
  const [feito, setFeito] = useState<{ tipo: 'ok' | 'err'; texto: string; whatsapp?: string; link?: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTermo(busca.trim()), 300);
    return () => clearTimeout(t);
  }, [busca]);
  useEffect(() => setPaginas(1), [status, termo]);

  const resumo = useDados(() => api<Resumo>('/admin/resumo'));
  const lista = useDados(() => {
    const q = new URLSearchParams({ porPagina: String(POR_PAGINA * paginas) });
    if (status) q.set('status', status);
    if (termo) q.set('busca', termo);
    return api<Pagina<PedidoAdmin> & { porStatus: Partial<Record<Status, number>> }>(`/admin/pedidos?${q}`);
  }, [status, termo, paginas]);

  const atualizar = () => {
    resumo.recarregar();
    lista.recarregar();
  };

  async function cancelar(e: PedidoAdmin) {
    const ativo = e.status === 'ativa';
    if (!confirm(ativo ? `Tirar o acesso de ${e.aluna.nome} a ${nomeItem(e)}?` : `Cancelar o pedido de ${e.aluna.nome}?`)) return;
    try {
      await api(`/admin/pedidos/${e.id}/cancelar`, { metodo: 'POST' });
      setFeito({ tipo: 'ok', texto: ativo ? `Acesso de ${e.aluna.nome} encerrado.` : `Pedido de ${e.aluna.nome} cancelado.` });
      atualizar();
    } catch (err) {
      setFeito({ tipo: 'err', texto: textoErro(err) });
    }
  }

  const r = resumo.dados;
  const l = lista.dados;
  const KPIS: [string, number | undefined][] = [
    ['Aguardando liberação', r?.pedidosPendentes],
    ['Acessos liberados', r?.acessosAtivos],
    ['Alunas ativas', r?.alunasAtivas],
    ['Itens no catálogo', r?.produtosPublicados],
  ];

  const Status = ({ e }: { e: PedidoAdmin }) =>
    e.status === 'ativa' ? (
      e.vencida ? <span className="tag tag-err">Vencido</span> : <span className="tag tag-ok"><Icon name="check" size={14} />Liberado</span>
    ) : e.status === 'pendente' ? (
      <span className="tag tag-warn">Pendente</span>
    ) : (
      <span className="tag">Cancelado</span>
    );
  const Acoes = ({ e, cheio }: { e: PedidoAdmin; cheio?: boolean }) => (
    <>
      <a className="icb icb-bd lg:h-11 lg:w-11" href={e.aluna.whatsappUrl} aria-label={`Conversar com ${e.aluna.nome} no WhatsApp`}><Icon name="whatsapp" /></a>
      {e.status === 'ativa' ? (
        <>
          <Link className={`btn btn-sec ${cheio ? 'flex-1' : ''}`} href={`/admin/alunas?busca=${encodeURIComponent(e.aluna.email)}`}>Ver aluna</Link>
          <button className="icb icb-bd text-muted lg:h-11 lg:w-11" type="button" onClick={() => cancelar(e)} aria-label={`Encerrar o acesso de ${e.aluna.nome}`} title="Encerrar acesso"><Icon name="x" /></button>
        </>
      ) : (
        <>
          <button className={`btn btn-pri ${cheio ? 'flex-1' : ''}`} type="button" onClick={() => setLiberando(e)}>Liberar acesso</button>
          {e.status === 'pendente' && <button className="icb icb-bd text-muted lg:h-11 lg:w-11" type="button" onClick={() => cancelar(e)} aria-label={`Cancelar o pedido de ${e.aluna.nome}`} title="Cancelar pedido"><Icon name="x" /></button>}
        </>
      )}
    </>
  );
  const Detalhe = ({ e }: { e: PedidoAdmin }) => (
    <>
      {e.produto && <span className="text-sm text-muted">{reais(e.produto.preco)}</span>}
      {e.dataTurma && <span className="text-sm text-muted"> · turma {dataCurta(e.dataTurma)}</span>}
      {e.expiraEm && <span className="text-sm text-muted"> · até {dataCurta(e.expiraEm)}</span>}
    </>
  );

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-10 lg:gap-8 lg:px-12 lg:pt-10 lg:pb-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1"><h1 className="t-h2">Pedidos de inscrição</h1><span className="text-muted">Libere o acesso depois de confirmar o pagamento no WhatsApp.</span></div>
        <button className="btn btn-sec lg:btn-pri" type="button" onClick={() => setManual(true)}><Icon name="plus" size={18} />Liberar para uma aluna</button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {KPIS.map(([t, n]) => (
          <div key={t} className="card kpi flex flex-col gap-1 p-4 lg:p-6"><span className="t-label">{t}</span><b className="num" aria-live="polite">{n ?? '–'}</b></div>
        ))}
      </div>

      {feito && (
        <Aviso tipo={feito.tipo}>
          <div className="flex flex-col gap-2">
            <span>{feito.texto}</span>
            {feito.link && <code className="break-all text-sm">{feito.link}</code>}
            <div className="flex flex-wrap gap-4">
              {feito.whatsapp && <a className="link-ul font-semibold" href={feito.whatsapp}>Avisar a aluna no WhatsApp</a>}
              <button className="link-ul font-semibold" type="button" onClick={() => setFeito(null)}>Fechar</button>
            </div>
          </div>
        </Aviso>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
          {FILTROS.map(([t, s]) => {
            const n = s ? l?.porStatus[s] : undefined;
            return (
              <button key={t} className={`tag tag-lk ${status === s ? 'tag-on' : ''}`} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {t}{s === 'pendente' && n !== undefined ? ` · ${n}` : ''}
              </button>
            );
          })}
        </div>
        <div className="find relative lg:w-[320px]">
          <label htmlFor="busca" className="sr">Buscar pedido</label>
          <input id="busca" type="search" name="busca" autoComplete="off" placeholder="Buscar por nome, e-mail ou WhatsApp…" style={{ paddingLeft: 44 }} value={busca} onChange={(e) => setBusca(e.target.value)} />
          <span className="pointer-events-none absolute top-3.5 left-3.5 text-muted"><Icon name="search" /></span>
        </div>
      </div>

      {lista.erro ? (
        <Aviso>{lista.erro}</Aviso>
      ) : !l ? (
        <Carregando />
      ) : l.itens.length === 0 ? (
        <p className="card p-8 text-center text-muted">{termo ? 'Nenhum pedido encontrado nessa busca.' : status === 'pendente' ? 'Nenhum pedido esperando. Quando alguém se inscrever, ele aparece aqui.' : 'Nenhum pedido aqui.'}</p>
      ) : (
        <>
          <div className="card hidden overflow-x-auto lg:block">
            <table className="list">
              <thead>
                <tr><th scope="col" className="pl-6">Aluna</th><th scope="col">Item</th><th scope="col" className="hidden xl:table-cell">WhatsApp</th><th scope="col">Pedido em</th><th scope="col">Status</th><th scope="col"><span className="sr">Ações</span></th></tr>
              </thead>
              <tbody>
                {l.itens.map((e) => (
                  <tr key={e.id}>
                    <td className="pl-6"><div className="flex items-center gap-3"><div className="ini" aria-hidden="true">{iniciais(e.aluna.nome)}</div><div className="flex flex-col"><b>{e.aluna.nome}</b><span className="text-sm text-muted">{e.aluna.email}</span></div></div></td>
                    <td style={{ whiteSpace: 'normal', minWidth: 170 }}><div className="flex flex-col">{nomeItem(e)}<span><Detalhe e={e} /></span></div></td>
                    <td className="num hidden xl:table-cell">{telefone(e.aluna.whatsapp)}</td>
                    <td className="num">{quando(e.solicitadaEm)}</td>
                    <td><Status e={e} /></td>
                    <td className="pr-6"><div className="flex items-center justify-end gap-2"><Acoes e={e} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 lg:hidden">
            {l.itens.map((e) => (
              <li key={e.id} className="card flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="ini" aria-hidden="true">{iniciais(e.aluna.nome)}</div>
                  <div className="flex min-w-0 flex-1 flex-col"><b>{e.aluna.nome}</b><span className="truncate text-sm text-muted">{e.aluna.email}</span></div>
                  <Status e={e} />
                </div>
                <span className="text-[15px]">{nomeItem(e)} <Detalhe e={e} /></span>
                <div className="num flex justify-between text-sm text-muted"><span>{telefone(e.aluna.whatsapp)}</span><span>{quando(e.solicitadaEm)}</span></div>
                <div className="flex gap-2"><Acoes e={e} cheio /></div>
              </li>
            ))}
          </ul>
          {l.itens.length < l.total && (
            <button className="btn btn-sec self-center" type="button" onClick={() => setPaginas((n) => n + 1)}>Mostrar mais ({l.total - l.itens.length})</button>
          )}
        </>
      )}

      <Modal aberto={Boolean(liberando)} aoFechar={() => setLiberando(null)} titulo="Liberar acesso">
        {liberando && (
          <Liberar
            e={liberando}
            pronto={() => {
              setFeito({ tipo: 'ok', texto: `Acesso liberado para ${liberando.aluna.nome}.`, whatsapp: avisoLiberado(liberando.aluna.nome, liberando.produto?.titulo ?? 'o curso', liberando.aluna.whatsapp) });
              setLiberando(null);
              atualizar();
            }}
          />
        )}
      </Modal>
      <Modal aberto={manual} aoFechar={() => setManual(false)} titulo="Liberar para uma aluna">
        <LiberarManual
          pronto={(texto, whatsapp, link) => {
            setFeito({ tipo: 'ok', texto, whatsapp, link });
            setManual(false);
            setStatus('ativa');
            atualizar();
          }}
        />
      </Modal>
    </div>
  );
}

/** Confirma a liberação; curso presencial pode já levar a data da turma. */
function Liberar({ e, pronto }: { e: PedidoAdmin; pronto: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const presencial = e.produto?.formato === 'presencial';

  async function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    setEnviando(true);
    setErro(null);
    try {
      await api(`/admin/pedidos/${e.id}/liberar`, { metodo: 'POST', corpo: { dataTurma: f.get('dataTurma') || undefined, expiraEm: f.get('expiraEm') || undefined } });
      pronto();
    } catch (err) {
      setErro(textoErro(err));
      setEnviando(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar}>
      <dl className="flex flex-col gap-2 rounded-xl bg-bg px-4 py-3.5">
        <div className="flex justify-between gap-4"><dt className="text-muted">Aluna</dt><dd className="text-right font-semibold">{e.aluna.nome}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Item</dt><dd className="text-right">{nomeItem(e)}</dd></div>
        {e.produto && <div className="flex justify-between gap-4"><dt className="text-muted">Valor</dt><dd className="num">{reais(e.produto.preco)}</dd></div>}
      </dl>
      {presencial && <div className="field"><label htmlFor="lib-turma">Data da turma <span className="font-normal text-muted">(opcional)</span></label><input id="lib-turma" name="dataTurma" type="date" /></div>}
      <div className="field">
        <label htmlFor="lib-validade">Acesso até <span className="font-normal text-muted">(opcional)</span></label>
        <input id="lib-validade" name="expiraEm" type="date" aria-describedby="lib-validade-dica" />
        <span id="lib-validade-dica" className="text-sm text-muted">Em branco, o acesso não vence.</span>
      </div>
      {erro && <Aviso>{erro}</Aviso>}
      <p className="text-sm text-muted">Confirme que o pagamento foi combinado no WhatsApp antes de liberar.</p>
      <button className="btn btn-pri btn-lg" type="submit" disabled={enviando}>{enviando ? 'Liberando…' : 'Liberar acesso'}</button>
    </form>
  );
}

/** Para quem fechou tudo pelo WhatsApp: aluna existente (pelo e-mail) ou nova. */
function LiberarManual({ pronto }: { pronto: (texto: string, whatsapp?: string, link?: string) => void }) {
  const produtos = useDados(() => api<ApiProduto[]>('/admin/produtos'));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoId, setProdutoId] = useState('');
  const escolhido = produtos.dados?.find((p) => p.id === produtoId);

  async function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    setEnviando(true);
    setErro(null);
    try {
      const email = f.email.trim().toLowerCase();
      const achadas = await api<Pagina<AlunaAdmin>>(`/admin/alunas?busca=${encodeURIComponent(email)}`);
      const existente = achadas.itens.find((a) => a.email === email);
      const r = await api<{ linkSenha?: string }>('/admin/pedidos', {
        metodo: 'POST',
        corpo: {
          productId: f.produto,
          ...(existente ? { userId: existente.id } : { aluna: { nome: f.nome, email, whatsapp: f.whatsapp } }),
          dataTurma: f.dataTurma || undefined,
          expiraEm: f.expiraEm || undefined,
        },
      });
      const nome = existente?.nome ?? f.nome;
      const zap = existente?.whatsapp ?? f.whatsapp;
      const item = escolhido?.titulo ?? 'o curso';
      if (r.linkSenha)
        pronto(
          `Acesso liberado e conta criada para ${nome}. Mande o link abaixo para ela criar a senha (vale 1 hora).`,
          wa(`Oi, ${nome.split(' ')[0]}! Seu acesso a ${item} foi liberado. Crie sua senha da área da aluna por este link (vale 1 hora): ${r.linkSenha}`, zap),
          r.linkSenha,
        );
      else pronto(`Acesso liberado para ${nome}.`, avisoLiberado(nome, item, zap));
    } catch (err) {
      setErro(textoErro(err));
      setEnviando(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar}>
      <div className="field">
        <label htmlFor="m-produto">Curso ou material</label>
        <select id="m-produto" name="produto" required value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
          <option value="" disabled>{produtos.dados ? 'Escolha…' : 'Carregando…'}</option>
          {produtos.dados?.filter((p) => p.tipo !== 'combo' || p.itens.length).map((p) => (
            <option key={p.id} value={p.id}>{p.titulo}{p.formato ? ` — ${NOME_FORMATO[p.formato]}` : ''}{p.publicado ? '' : ' (não publicado)'}</option>
          ))}
        </select>
      </div>
      <div className="field"><label htmlFor="m-email">E-mail da aluna</label><input id="m-email" name="email" type="email" required spellCheck={false} autoComplete="off" aria-describedby="m-email-dica" /><span id="m-email-dica" className="text-sm text-muted">Se ela já tiver conta, o acesso entra na conta dela.</span></div>
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-3">
        <div className="field flex-1"><label htmlFor="m-nome">Nome</label><input id="m-nome" name="nome" type="text" required autoComplete="off" maxLength={120} /></div>
        <div className="field flex-1"><label htmlFor="m-zap">WhatsApp</label><input id="m-zap" name="whatsapp" type="tel" inputMode="tel" required minLength={10} autoComplete="off" placeholder="(11) 90000-0000" /></div>
      </div>
      {escolhido?.formato === 'presencial' && <div className="field"><label htmlFor="m-turma">Data da turma <span className="font-normal text-muted">(opcional)</span></label><input id="m-turma" name="dataTurma" type="date" /></div>}
      <div className="field"><label htmlFor="m-validade">Acesso até <span className="font-normal text-muted">(opcional)</span></label><input id="m-validade" name="expiraEm" type="date" /></div>
      {(erro || produtos.erro) && <Aviso>{erro ?? produtos.erro}</Aviso>}
      <button className="btn btn-pri btn-lg" type="submit" disabled={enviando}>{enviando ? 'Liberando…' : 'Liberar acesso'}</button>
    </form>
  );
}
