import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { FormDemo } from '@/components/Interativos';
import { Logo, Preco } from '@/components/Site';
import { foto } from '@/lib/site';

export const metadata: Metadata = { title: 'Inscrição' };

export default function Inscricao() {
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-14 items-center justify-between lg:h-[72px]">
          <Logo />
          <span className="text-sm text-muted">Já tem conta? <Link className="link-ul font-semibold text-accent" href="/entrar">Entrar</Link></span>
        </div>
      </header>
      <main id="conteudo" className="wrap flex flex-col gap-8 pt-6 pb-14 lg:flex-row-reverse lg:items-start lg:justify-between lg:gap-24 lg:pt-[72px] lg:pb-24">
        <aside className="card flex flex-col overflow-hidden lg:w-[480px] lg:flex-none" aria-label="Resumo da inscrição">
          <div className="photo hidden h-[220px] rounded-none lg:block"><img src={foto('pdf-curso-p3-03.jpg')} alt="" width={681} height={1210} style={{ objectPosition: '50% 35%' }} /></div>
          <div className="flex flex-col gap-4 p-5 lg:p-7">
            <div className="flex items-center gap-4">
              <img className="h-[72px] w-[72px] flex-none rounded-xl object-cover lg:hidden" src={foto('pdf-curso-p3-03.jpg')} alt="" width={681} height={1210} />
              <div className="flex flex-col gap-1">
                <span className="t-label">Você está se inscrevendo em</span>
                <h2 className="t-h3">Extensão de Cílios — Iniciante</h2>
              </div>
            </div>
            <span className="tag self-start"><Icon name="map-pin" size={14} />Presencial · 2&nbsp;dias em Osasco-SP</span>
            <div className="border-y border-line py-4"><Preco size={36} sufixo="à vista ou em até 12x" /></div>
            <ul className="checks text-sm">
              <li><Icon name="package" size={18} />Kit completo com 20&nbsp;itens</li>
              <li><Icon name="book" size={18} />Apostila exclusiva</li>
              <li><Icon name="award" size={18} />Certificado de conclusão</li>
            </ul>
            <p className="flex items-start gap-2 text-sm text-muted"><Icon name="whatsapp" size={18} />Depois de enviar, você fala com a Camilla no WhatsApp para combinar o pagamento.</p>
          </div>
        </aside>
        <FormDemo to="/inscricao/enviada" className="flex max-w-[600px] min-w-0 flex-1 flex-col gap-6">
          <Link className="go self-start text-muted" href="/cursos/extensao-de-cilios"><Icon name="arrow-left" size={18} />Voltar para o curso</Link>
          <div className="flex flex-col gap-3">
            <h1 className="t-h1 lg:text-[56px]">Seus dados</h1>
            <p className="lead text-muted">Leva menos de um minuto. O pagamento é combinado depois, pelo WhatsApp.</p>
          </div>
          <div className="field"><label htmlFor="nome">Nome completo</label><input id="nome" name="nome" type="text" autoComplete="name" required placeholder="Seu nome…" /></div>
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-4">
            <div className="field flex-1"><label htmlFor="zap">WhatsApp</label><input id="zap" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(11) 90000-0000…" /></div>
            <div className="field flex-1"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" spellCheck={false} required placeholder="voce@exemplo.com…" /></div>
          </div>
          <div className="field"><label htmlFor="senha">Crie uma senha</label><input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required placeholder="Mínimo de 8 caracteres…" /></div>
          <button className="btn btn-pri btn-lg lg:self-start" type="submit">Enviar inscrição<Icon name="arrow-right" size={18} /></button>
        </FormDemo>
      </main>
    </>
  );
}
