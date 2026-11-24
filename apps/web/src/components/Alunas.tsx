'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { Aviso, Carregando, Modal, NOME_FORMATO, dataCurta, dataLonga, iniciais, telefone, useDados } from './ui';
import { api, textoErro } from '@/lib/api';
import type { AlunaAdmin, Pagina, Pedido, Usuaria } from '@/lib/tipos';

const STATUS = { pendente: ['tag-warn', 'Pendente'], ativa: ['tag-ok', 'Liberado'], cancelada: ['', 'Cancelado'] } as const;

/** Alunas: busca, pedidos de cada uma e o link para criar senha nova. */
export function Alunas() {
  const inicial = useSearchParams().get('busca') ?? '';
  const [busca, setBusca] = useState(inicial);
  const [termo, setTermo] = useState(inicial.trim());
  const [aberta, setAberta] = useState<string | null>(null);
  const [link, setLink] = useState<{ nome: string; link: string; whatsappUrl: string } | null>(null);
  const [erroLink, setErroLink] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTermo(busca.trim()), 300);
    return () => clearTimeout(t);
  }, [busca]);

  const { dados, erro } = useDados(() => api<Pagina<AlunaAdmin>>(`/admin/alunas?porPagina=50${termo ? `&busca=${encodeURIComponent(termo)}` : ''}`), [termo]);

  async function gerarLink(a: AlunaAdmin) {
    setErroLink(null);
    try {
      const r = await api<{ link: string; whatsappUrl: string }>(`/admin/alunas/${a.id}/link-senha`, { metodo: 'POST' });
      setLink({ nome: a.nome, ...r });
    } catch (e) {
      setErroLink(textoErro(e));
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-10 lg:gap-8 lg:px-12 lg:pt-10 lg:pb-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1"><h1 className="t-h2">Alunas</h1><span className="text-muted">Quem já se cadastrou, com os pedidos de cada uma.</span></div>
        <div className="find relative lg:w-[320px]">
          <label htmlFor="busca-alunas" className="sr">Buscar aluna</label>
          <input id="busca-alunas" type="search" autoComplete="off" placeholder="Buscar por nome, e-mail ou WhatsApp…" style={{ paddingLeft: 44 }} value={busca} onChange={(e) => setBusca(e.target.value)} />
          <span className="pointer-events-none absolute top-3.5 left-3.5 text-muted"><Icon name="search" /></span>
        </div>
      </div>
      {erroLink && <Aviso>{erroLink}</Aviso>}
      {erro ? (
        <Aviso>{erro}</Aviso>
      ) : !dados ? (
        <Carregando />
      ) : !dados.itens.length ? (
        <p className="card p-8 text-center text-muted">{termo ? 'Nenhuma aluna encontrada nessa busca.' : 'Nenhuma aluna cadastrada ainda.'}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {dados.itens.map((a) => (
            <li key={a.id} className="card flex flex-col">
              <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:gap-4 lg:px-5">
                <button className="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" aria-expanded={aberta === a.id} onClick={() => setAberta(aberta === a.id ? null : a.id)}>
                  <div className="ini" aria-hidden="true">{iniciais(a.nome)}</div>
                  <div className="flex min-w-0 flex-1 flex-col"><b>{a.nome}</b><span className="truncate text-sm text-muted">{a.email} · <span className="num">{telefone(a.whatsapp)}</span></span></div>
                  <Icon name="chevron" className={`text-muted transition-transform ${aberta === a.id ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  {a.pedidos.ativa > 0 && <span className="tag tag-ok">{a.pedidos.ativa} liberado{a.pedidos.ativa > 1 ? 's' : ''}</span>}
                  {a.pedidos.pendente > 0 && <span className="tag tag-warn">{a.pedidos.pendente} pendente{a.pedidos.pendente > 1 ? 's' : ''}</span>}
                  <a className="icb icb-bd h-11 w-11" href={a.whatsappUrl} aria-label={`Conversar com ${a.nome} no WhatsApp`}><Icon name="whatsapp" /></a>
                  <button className="btn btn-sec" type="button" onClick={() => gerarLink(a)}><Icon name="lock" size={18} />Link de senha</button>
                </div>
              </div>
              {aberta === a.id && <PedidosDaAluna id={a.id} />}
            </li>
          ))}
        </ul>
      )}
      {dados && dados.total > dados.itens.length && <p className="text-sm text-muted">Mostrando {dados.itens.length} de {dados.total}. Use a busca para achar as outras.</p>}

      <Modal aberto={Boolean(link)} aoFechar={() => setLink(null)} titulo="Link para criar senha">
        {link && <LinkSenha {...link} />}
      </Modal>
    </div>
  );
}

function PedidosDaAluna({ id }: { id: string }) {
  const { dados, erro } = useDados(() => api<Usuaria & { pedidos: Pedido[] }>(`/admin/alunas/${id}`), [id]);
  if (erro) return <div className="px-4 pb-4"><Aviso>{erro}</Aviso></div>;
  if (!dados) return <Carregando />;
  return (
    <div className="flex flex-col gap-2 border-t border-line px-4 py-4 lg:px-5">
      <span className="text-sm text-muted">Cadastrada em {dataLonga(dados.criadoEm)}</span>
      {dados.pedidos.length ? (
        dados.pedidos.map((e) => {
          const [cls, txt] = e.vencida ? (['tag-err', 'Vencido'] as const) : STATUS[e.status];
          return (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg px-4 py-3">
              <span className="min-w-0">{e.produto?.titulo}{e.produto?.formato ? ` — ${NOME_FORMATO[e.produto.formato]}` : ''}{e.dataTurma ? <span className="text-sm text-muted"> · turma {dataCurta(e.dataTurma)}</span> : null}</span>
              <span className={`tag ${cls}`}>{txt}</span>
            </div>
          );
        })
      ) : (
        <span className="text-muted">Nenhum pedido.</span>
      )}
    </div>
  );
}

function LinkSenha({ nome, link, whatsappUrl }: { nome: string; link: string; whatsappUrl: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">Mande este link para {nome.split(' ')[0]}. Ele vale 1 hora e só funciona uma vez.</p>
      <code className="break-all rounded-xl bg-bg px-4 py-3 text-sm">{link}</code>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a className="btn btn-pri flex-1" href={whatsappUrl}><Icon name="whatsapp" size={18} />Mandar no WhatsApp</a>
        <button className="btn btn-sec flex-1" type="button" onClick={() => navigator.clipboard.writeText(link).then(() => setCopiado(true))}><Icon name={copiado ? 'check' : 'copy'} size={18} />{copiado ? 'Copiado' : 'Copiar link'}</button>
      </div>
    </div>
  );
}
