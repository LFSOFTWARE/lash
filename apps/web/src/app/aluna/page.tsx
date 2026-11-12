import Link from 'next/link';
import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { WA, foto } from '@/lib/site';

export const metadata: Metadata = { title: 'Meus cursos' };

export default function Aluna() {
  return (
    <AppShell area="aluna" ativo="/aluna">
      <div className="flex flex-col gap-8 px-5 pt-6 pb-10 lg:px-12 lg:pt-10 lg:pb-14">
        <div className="flex items-center justify-between">
          <div className="flex flex-col"><h1 className="t-h2">Olá, Ana</h1><span className="text-muted">Continue de onde você parou.</span></div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end"><b className="text-sm">Ana Souza</b><span className="text-sm text-muted">Aluna</span></div>
            <div className="ini" aria-hidden="true">AS</div>
          </div>
        </div>

        <div className="card flex flex-col overflow-hidden lg:flex-row">
          <div className="photo dim h-[190px] flex-none rounded-none lg:h-[250px] lg:w-[380px]">
            <img src={foto('pdf-curso-p3-03.jpg')} alt="" width={681} height={1210} style={{ objectPosition: '50% 35%' }} />
            <Link className="play" href="/aluna/aula" aria-label="Continuar a aula"><Icon name="play" size={20} /></Link>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 lg:p-8">
            <span className="t-label">Continuar assistindo · online</span>
            <h2 className="t-h3 lg:text-[34px]">Extensão de Cílios — Iniciante</h2>
            <span className="text-muted">Fundamentos · Ciclo de vida dos cílios</span>
            <div className="flex items-center gap-4">
              <div className="bar flex-1" role="progressbar" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do curso"><i style={{ '--p': 0.33 } as React.CSSProperties} /></div>
              <b className="num text-sm">4 de 12 aulas</b>
            </div>
            <Link className="btn btn-pri mt-1 lg:self-start" href="/aluna/aula"><Icon name="play" size={16} />Continuar aula</Link>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="t-h3">Meus cursos</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            <Link className="card flex flex-col overflow-hidden" href="/aluna/aula">
              <div className="photo aspect-video rounded-none"><img src={foto('pdf-curso-p3-03.jpg')} alt="" width={681} height={1210} style={{ objectPosition: '50% 35%' }} /></div>
              <div className="flex flex-col gap-3 p-5">
                <span className="tag tag-ok self-start"><Icon name="check" size={14} />Liberado · online</span>
                <h3 className="t-h3">Extensão de Cílios — Iniciante</h3>
                <div className="flex items-center gap-3"><div className="bar flex-1"><i style={{ '--p': 0.33 } as React.CSSProperties} /></div><span className="num text-sm">33%</span></div>
              </div>
            </Link>
            <div className="card flex flex-col overflow-hidden">
              <div className="photo aspect-video rounded-none"><img src={foto('post-12.jpg')} alt="" width={480} height={640} style={{ objectPosition: '50% 20%' }} /></div>
              <div className="flex flex-col gap-3 p-5">
                <span className="tag tag-warn self-start"><Icon name="clock" size={14} />Aguardando confirmação</span>
                <h3 className="t-h3">Design de Sobrancelhas</h3>
                <a className="go self-start text-sm" href={WA}><Icon name="whatsapp" size={16} />Combinar pagamento</a>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="t-h3">Turma presencial</h2>
          <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center lg:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-4"><div className="ficon"><Icon name="calendar" /></div><div className="flex flex-col"><b>Extensão de Cílios · 2&nbsp;dias em Osasco-SP</b><span className="text-sm text-muted">A data é combinada com a Camilla pelo WhatsApp.</span></div></div>
            <a className="btn btn-sec" href={WA}><Icon name="whatsapp" size={18} />Combinar data</a>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="t-h3">Minhas apostilas</h2>
          <div className="card flex items-center gap-4 p-4 lg:px-5">
            <div className="ficon"><Icon name="file" /></div>
            <div className="flex min-w-0 flex-1 flex-col"><b>Apostila Profissional de Extensão de Cílios</b><span className="text-sm text-muted">PDF · 30&nbsp;páginas · 23,6&nbsp;MB</span></div>
            <button className="btn btn-sec" type="button" aria-label="Baixar apostila (indisponível no teste)" disabled><Icon name="download" size={18} /><span>Baixar</span></button>
          </div>
        </section>

        <section id="certificados" className="flex flex-col gap-4">
          <h2 className="t-h3">Certificados</h2>
          <p className="card p-5 text-muted">Seu certificado aparece aqui quando você concluir as 12 aulas.</p>
        </section>
      </div>
    </AppShell>
  );
}
