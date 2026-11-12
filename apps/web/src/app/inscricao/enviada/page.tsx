import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Site';
import { CURSO, WA } from '@/lib/site';

export const metadata: Metadata = { title: 'Inscrição recebida' };

export default function Enviada() {
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-14 items-center justify-between lg:h-[72px]">
          <Logo />
          <Link className="btn btn-sec" href="/aluna"><Icon name="user" size={18} />Área da aluna</Link>
        </div>
      </header>
      <main id="conteudo" className="wrap flex flex-col items-center gap-8 pt-12 pb-16 text-center lg:pt-24 lg:pb-[120px]">
        <div className="ficon h-[72px] w-[72px] rounded-full bg-okbg text-ok lg:h-[88px] lg:w-[88px]"><Icon name="check" size={36} /></div>
        <div className="flex flex-col items-center gap-4">
          <h1 className="t-h1 lg:text-[56px]">Inscrição recebida</h1>
          <p className="lead max-w-[52ch] text-muted">Falta um passo: fale com a Camilla no WhatsApp para combinar o pagamento. Assim que confirmar, seu acesso é liberado.</p>
        </div>
        <dl className="card flex w-full max-w-[560px] flex-col gap-4 p-5 text-left lg:p-7">
          <div className="flex justify-between gap-4"><dt className="text-muted">Curso</dt><dd className="text-right font-semibold">{CURSO.titulo}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Formato</dt><dd className="text-right">Presencial · 2&nbsp;dias em Osasco-SP</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Valor</dt><dd className="num font-semibold">{CURSO.preco}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted">Status</dt><dd><span className="tag tag-warn"><Icon name="clock" size={14} />Aguardando confirmação</span></dd></div>
        </dl>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
          <a className="btn btn-pri btn-lg" href={WA}><Icon name="whatsapp" size={18} />Continuar no WhatsApp</a>
          <Link className="btn btn-sec btn-lg" href="/aluna">Ir para a área da aluna</Link>
        </div>
      </main>
    </>
  );
}
