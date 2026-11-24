'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, type IconName } from './Icon';
import { PrecoCarregando, PrecoProduto } from './Produto';
import { Aviso, NOME_FORMATO } from './ui';
import { ApiErro, api, gravarSessao, sair, textoErro, useSessao } from '@/lib/api';
import { PAGINA_CILIOS, cartao, etiqueta, imagem, linkProduto, posicao, reais, useCatalogo } from '@/lib/catalogo';
import { WA, wa } from '@/lib/site';
import type { ApiProduto, Pedido, RespostaLogin, RespostaPedido } from '@/lib/tipos';

const PADRAO = 'extensao-de-cilios-presencial';
const ULTIMO = 'lash.ultimoPedido';

function inclui(p: ApiProduto): [IconName, string][] {
  if (p.tipo === 'curso' && p.formato === 'online') return [['video', 'Aulas gravadas, no seu ritmo'], ['book', 'Apostila exclusiva'], ['award', 'Certificado de conclusão']];
  if (p.tipo === 'curso' && p.slug.startsWith('extensao-de-cilios')) return [['package', 'Kit completo com 20 itens'], ['book', 'Apostila exclusiva'], ['award', 'Certificado de conclusão']];
  if (p.tipo === 'curso') return [['users', 'Prática com acompanhamento'], ['award', 'Certificado de conclusão']];
  return [['download', 'Arquivo liberado na sua área de aluna'], ['shield', 'Acesso depois da confirmação do pagamento']];
}

/** Tela de inscrição: resumo do produto escolhido (?produto=slug) e o formulário. */
export function Inscricao() {
  const slug = useSearchParams().get('produto') ?? PADRAO;
  const { produtos, erro } = useCatalogo();
  const p = produtos?.find((x) => x.slug === slug);
  const voltar = p ? linkProduto(p) === PAGINA_CILIOS ? PAGINA_CILIOS : '/catalogo' : '/catalogo';

  return (
    <main id="conteudo" className="wrap flex flex-col gap-8 pt-6 pb-14 lg:flex-row-reverse lg:items-start lg:justify-between lg:gap-24 lg:pt-[72px] lg:pb-24">
      <aside className="card flex flex-col overflow-hidden lg:w-[480px] lg:flex-none" aria-label="Resumo da inscrição" aria-busy={!produtos}>
        {p ? (
          <>
            <div className="photo hidden h-[220px] rounded-none lg:block"><img src={imagem(p.capa)} alt="" width={681} height={1210} style={{ objectPosition: posicao(p.slug) }} /></div>
            <div className="flex flex-col gap-4 p-5 lg:p-7">
              <div className="flex items-center gap-4">
                <img className="h-[72px] w-[72px] flex-none rounded-xl object-cover lg:hidden" src={imagem(p.capa)} alt="" width={681} height={1210} />
                <div className="flex flex-col gap-1">
                  <span className="t-label">{p.tipo === 'curso' ? 'Você está se inscrevendo em' : 'Você está pedindo'}</span>
                  <h2 className="t-h3">{p.titulo}</h2>
                </div>
              </div>
              <span className="tag self-start"><Icon name={p.formato === 'online' ? 'video' : p.formato ? 'map-pin' : 'file'} size={14} />{etiqueta(p)}{p.local ? ` em ${p.local}` : ''}</span>
              <div className="border-y border-line py-4"><PrecoProduto p={cartao(p)} size={36} sufixo={p.condicoes} /></div>
              <ul className="checks text-sm">
                {inclui(p).map(([ic, t]) => <li key={t}><Icon name={ic} size={18} />{t}</li>)}
              </ul>
              <p className="flex items-start gap-2 text-sm text-muted"><Icon name="whatsapp" size={18} />Depois de enviar, você fala com a Camilla no WhatsApp para combinar o pagamento.</p>
            </div>
          </>
        ) : produtos || erro ? (
          <div className="flex flex-col gap-3 p-5 lg:p-7">
            <b>{erro ? 'Não foi possível carregar o produto.' : 'Produto não encontrado.'}</b>
            <span className="text-muted">{erro ?? 'Ele pode ter saído do catálogo.'}</span>
            <Link className="btn btn-sec self-start" href="/catalogo">Ver o catálogo</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-5 lg:p-7"><span className="h-7 w-3/4 animate-pulse rounded-lg bg-line" /><PrecoCarregando size={36} /></div>
        )}
      </aside>
      <div className="flex max-w-[600px] min-w-0 flex-1 flex-col gap-6">
        <Link className="go self-start text-muted" href={voltar}><Icon name="arrow-left" size={18} />Voltar</Link>
        <FormInscricao produto={p} />
      </div>
    </main>
  );
}

function FormInscricao({ produto }: { produto?: ApiProduto }) {
  const router = useRouter();
  const sessao = useSessao();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<{ texto: string; temConta?: boolean } | null>(null);
  const logada = sessao?.usuaria;
  const volta = `/inscricao?produto=${produto?.slug ?? PADRAO}`;

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!produto) return;
    setEnviando(true);
    setErro(null);
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      let r: RespostaPedido;
      if (logada) {
        r = await api<RespostaPedido>('/aluna/pedidos', { metodo: 'POST', corpo: { productId: produto.id } });
      } else {
        const res = await api<RespostaLogin & RespostaPedido>('/inscricoes', { metodo: 'POST', corpo: { nome: f.nome, email: f.email, whatsapp: f.whatsapp, senha: f.senha, productId: produto.id } });
        gravarSessao({ usuaria: res.usuaria, accessToken: res.accessToken, refreshToken: res.refreshToken });
        r = res;
      }
      try {
        sessionStorage.setItem(ULTIMO, JSON.stringify(r));
      } catch {}
      router.push('/inscricao/enviada');
    } catch (err) {
      setErro({ texto: textoErro(err), temConta: err instanceof ApiErro && err.status === 409 && !logada });
      setEnviando(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={enviar}>
      <div className="flex flex-col gap-3">
        <h1 className="t-h1 lg:text-[56px]">{logada ? 'Confirmar pedido' : 'Seus dados'}</h1>
        <p className="lead text-muted">{logada ? 'Seus dados já estão na sua conta. O pagamento é combinado depois, pelo WhatsApp.' : 'Leva menos de um minuto. O pagamento é combinado depois, pelo WhatsApp.'}</p>
      </div>
      {logada ? (
        <div className="card flex items-center gap-4 p-4">
          <div className="ficon"><Icon name="user" /></div>
          <div className="flex min-w-0 flex-1 flex-col"><b className="truncate">{logada.nome}</b><span className="truncate text-sm text-muted">{logada.email}</span></div>
          <button className="link-ul text-sm font-semibold text-accent" type="button" onClick={() => sair()}>Não é você?</button>
        </div>
      ) : (
        <>
          <div className="field"><label htmlFor="nome">Nome completo</label><input id="nome" name="nome" type="text" autoComplete="name" required maxLength={120} placeholder="Seu nome…" /></div>
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-4">
            <div className="field flex-1"><label htmlFor="zap">WhatsApp</label><input id="zap" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required minLength={10} title="DDD e número, por exemplo (11) 90000-0000" placeholder="(11) 90000-0000…" /></div>
            <div className="field flex-1"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" spellCheck={false} required placeholder="voce@exemplo.com…" /></div>
          </div>
          <div className="field"><label htmlFor="senha">Crie uma senha</label><input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required placeholder="Mínimo de 8 caracteres…" /></div>
        </>
      )}
      {erro && (
        <Aviso>
          {erro.texto}
          {erro.temConta && <> <Link className="link-ul font-semibold" href={`/entrar?volta=${encodeURIComponent(volta)}`}>Entrar e continuar</Link></>}
        </Aviso>
      )}
      <button className="btn btn-pri btn-lg lg:self-start" type="submit" disabled={!produto || enviando}>
        {enviando ? 'Enviando…' : logada ? 'Confirmar pedido' : 'Enviar inscrição'}<Icon name="arrow-right" size={18} />
      </button>
      {!logada && <p className="text-sm text-muted">Já tem conta? <Link className="link-ul font-semibold text-accent" href={`/entrar?volta=${encodeURIComponent(volta)}`}>Entre para pedir mais rápido</Link></p>}
    </form>
  );
}

/** Confirmação depois da inscrição: dados do pedido e o botão do WhatsApp com a mensagem pronta. */
export function Enviada() {
  const [r, setR] = useState<RespostaPedido | null>(null);
  useEffect(() => {
    try {
      setR(JSON.parse(sessionStorage.getItem(ULTIMO) ?? 'null'));
    } catch {}
  }, []);
  const pedido: Pedido | undefined = r?.pedido;
  const p = pedido?.produto;
  const liberado = pedido?.status === 'ativa';
  return (
    <main id="conteudo" className="wrap flex flex-col items-center gap-8 pt-12 pb-16 text-center lg:pt-24 lg:pb-[120px]">
      <div className="ficon h-[72px] w-[72px] rounded-full bg-okbg text-ok lg:h-[88px] lg:w-[88px]"><Icon name="check" size={36} /></div>
      <div className="flex flex-col items-center gap-4">
        <h1 className="t-h1 lg:text-[56px]">{p?.tipo === 'curso' || !p ? 'Inscrição recebida' : 'Pedido recebido'}</h1>
        <p className="lead max-w-[52ch] text-muted">Falta um passo: fale com a Camilla no WhatsApp para combinar o pagamento. Assim que confirmar, seu acesso é liberado.</p>
      </div>
      {p && (
        <dl className="card flex w-full max-w-[560px] flex-col gap-4 p-5 text-left lg:p-7">
          <div className="flex justify-between gap-4"><dt className="text-muted">{p.tipo === 'curso' ? 'Curso' : 'Item'}</dt><dd className="text-right font-semibold">{p.titulo}</dd></div>
          {p.formato && <div className="flex justify-between gap-4"><dt className="text-muted">Formato</dt><dd className="text-right">{NOME_FORMATO[p.formato]}</dd></div>}
          <div className="flex justify-between gap-4"><dt className="text-muted">Valor</dt><dd className="num font-semibold">{reais(p.preco)}</dd></div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Status</dt>
            <dd>{liberado ? <span className="tag tag-ok"><Icon name="check" size={14} />Liberado</span> : <span className="tag tag-warn"><Icon name="clock" size={14} />Aguardando confirmação</span>}</dd>
          </div>
        </dl>
      )}
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
        <a className="btn btn-pri btn-lg" href={r?.whatsappUrl ?? (p ? wa(`Olá, Camilla! Acabei de pedir: ${p.titulo}. Como faço o pagamento?`) : WA)}><Icon name="whatsapp" size={18} />Continuar no WhatsApp</a>
        <Link className="btn btn-sec btn-lg" href="/aluna">Ir para a área da aluna</Link>
      </div>
    </main>
  );
}
