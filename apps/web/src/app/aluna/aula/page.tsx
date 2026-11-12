import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { AULA_ATUAL, MODULOS, foto } from '@/lib/site';

export const metadata: Metadata = { title: 'Ciclo de vida dos cílios' };

export default function Aula() {
  let atingiu = false;
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-line bg-white px-5 lg:h-[72px] lg:px-10">
        <div className="flex min-w-0 items-center gap-6">
          <Link className="go text-muted" href="/aluna"><Icon name="arrow-left" size={18} /><span className="hidden sm:inline">Meus cursos</span><span className="sr sm:hidden">Meus cursos</span></Link>
          <b className="truncate">Extensão de Cílios — Iniciante</b>
        </div>
        <div className="flex flex-none items-center gap-4 lg:w-[340px]">
          <div className="bar hidden flex-1 lg:block"><i style={{ '--p': 0.33 } as React.CSSProperties} /></div>
          <span className="num text-sm">4 de 12</span>
          <div className="ini hidden lg:flex" aria-hidden="true">AS</div>
        </div>
      </header>
      <div className="lg:flex lg:items-stretch">
        <main id="conteudo" className="flex min-w-0 flex-1 flex-col gap-6 lg:px-12 lg:pt-10 lg:pb-16">
          <div className="photo dim h-[220px] rounded-none lg:h-[540px] lg:rounded-[20px]">
            <img src={foto('post-04.jpg')} alt="" width={480} height={640} style={{ objectPosition: '50% 40%' }} />
            <button className="play" type="button" aria-label="Reproduzir aula (vídeo de exemplo)"><Icon name="play" size={20} /></button>
          </div>
          <div className="flex flex-col gap-6 px-5 lg:px-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="flex flex-col gap-2"><span className="t-label">Fundamentos · Aula 4 de 12</span><h1 className="t-h2">Ciclo de vida dos cílios</h1></div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link className="btn btn-sec" href="/aluna/aula"><Icon name="arrow-left" size={18} />Anterior</Link>
                <button className="btn btn-pri sm:flex-1 lg:flex-none" type="button"><Icon name="check" size={18} />Marcar como concluída</button>
              </div>
            </div>
            <p className="max-w-[62ch] text-muted">Os fios passam pelas fases anágena, catágena e telógena, e perdemos naturalmente de 3 a 5 por dia. Entender esse ciclo explica por que as manutenções são necessárias e por que cada cliente tem o seu tempo.</p>
            <div className="flex flex-col gap-3">
              <h2 className="t-h3">Materiais da aula</h2>
              <div className="card flex items-center gap-4 p-4 lg:px-5">
                <div className="ficon"><Icon name="file" /></div>
                <div className="flex min-w-0 flex-1 flex-col"><b>Apostila — página 8: ciclo de vida dos cílios</b><span className="text-sm text-muted">PDF</span></div>
                <button className="btn btn-sec" type="button" aria-label="Baixar material (indisponível no teste)" disabled><Icon name="download" size={18} /><span>Baixar</span></button>
              </div>
            </div>
          </div>
        </main>
        <nav className="mt-8 flex flex-col border-t border-line bg-white px-1 pt-1 pb-5 lg:mt-0 lg:w-[400px] lg:flex-none lg:border-t-0 lg:border-l lg:px-4 lg:py-6" aria-label="Conteúdo do curso">
          <b className="hidden px-4 text-[17px] lg:block">Conteúdo do curso</b>
          {MODULOS.map((m) => (
            <div key={m.nome} className="flex flex-col">
              <div className="mod">{m.nome}</div>
              {m.aulas.map((a) => {
                const atual = a === AULA_ATUAL;
                const feita = !atingiu && !atual;
                if (atual) atingiu = true;
                return (
                  <Link key={a} className="lesson" href="/aluna/aula" aria-current={atual ? 'true' : undefined}>
                    <span className={`dot ${feita ? 'dot-done' : ''}`}>{feita && <Icon name="check" size={14} />}</span>
                    {a}
                    {feita && <span className="sr"> (concluída)</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
