import Link from 'next/link';
import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { CURSO, MODULOS, foto } from '@/lib/site';

export const metadata: Metadata = { title: 'Editar curso' };

const SEM_VIDEO = 'Volume Europeu (4D)';

export default function EditarCurso() {
  return (
    <AppShell area="admin" ativo="/admin/curso">
      <form className="flex flex-col gap-6 px-5 pt-6 pb-10 lg:gap-8 lg:px-12 lg:pt-10 lg:pb-14" action="#salvar">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <nav className="text-sm text-muted" aria-label="Você está em"><Link className="link-ul" href="/catalogo">Cursos e materiais</Link> / Editar</nav>
            <h1 className="t-h2">Extensão de Cílios — Iniciante</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag tag-ok"><Icon name="check" size={14} />Publicado</span>
            <Link className="btn btn-sec" href="/cursos/extensao-de-cilios"><Icon name="eye" size={18} />Ver página</Link>
            <button className="btn btn-pri flex-1 lg:flex-none" type="button">Salvar alterações</button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="card flex flex-col gap-4 p-5 lg:w-[420px] lg:flex-none lg:p-7">
            <h2 className="t-h3">Informações</h2>
            <div className="photo h-[180px]"><img src={foto('pdf-curso-p3-03.jpg')} alt="Capa atual do curso" width={681} height={1210} style={{ objectPosition: '50% 35%' }} /></div>
            <button className="btn btn-sec self-start" type="button"><Icon name="image" size={18} />Trocar capa</button>
            <div className="field"><label htmlFor="titulo">Título</label><input id="titulo" name="titulo" type="text" autoComplete="off" defaultValue={CURSO.titulo} /></div>
            <div className="flex gap-3">
              <div className="field flex-1"><label htmlFor="formatos">Formatos</label><input id="formatos" name="formatos" type="text" autoComplete="off" defaultValue="Presencial e online" /></div>
              <div className="field w-[120px]"><label htmlFor="area">Área</label><input id="area" name="area" type="text" autoComplete="off" defaultValue="Cílios" /></div>
            </div>
            <div className="flex gap-3">
              <div className="field flex-1"><label htmlFor="preco">Preço atual</label><input id="preco" name="preco" type="text" inputMode="decimal" autoComplete="off" defaultValue="R$ 1.000,00" /></div>
              <div className="field flex-1"><label htmlFor="preco-de">Preço original <span className="font-normal text-muted">(opcional)</span></label><input id="preco-de" name="precoOriginal" type="text" inputMode="decimal" autoComplete="off" defaultValue="R$ 1.200,00" aria-describedby="preco-dica" /></div>
            </div>
            <div id="preco-dica" className="flex flex-col gap-2 rounded-xl bg-bg px-4 py-3.5">
              <span className="t-label">Como aparece no site</span>
              <div className="flex flex-wrap items-center gap-3">
                <s className="was num">{CURSO.precoOriginal}</s><span className="tag tag-off">{CURSO.desconto}</span>
                <span className="price num" style={{ fontSize: 22 }}>{CURSO.preco}</span>
              </div>
              <span className="text-sm text-muted">Deixe o preço original em branco para mostrar só o preço atual.</span>
            </div>
            <div className="field"><label htmlFor="acesso">Acesso às aulas</label><input id="acesso" name="acesso" type="text" autoComplete="off" defaultValue="12 meses" /></div>
            <div className="field"><label htmlFor="descricao">Descrição</label><textarea id="descricao" name="descricao" defaultValue="Intensivo de 2 dias: teoria, treino e prática com modelo real." /></div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center justify-between"><h2 className="t-h3">Módulos e aulas</h2><button className="btn btn-sec" type="button"><Icon name="plus" size={18} />Novo módulo</button></div>
            {MODULOS.map((m) => (
              <div key={m.nome} className="card flex flex-col gap-2 p-3 lg:p-4">
                <div className="flex items-center justify-between p-2"><b className="flex items-center gap-2"><span className="text-muted"><Icon name="grip" size={18} /></span>{m.nome}</b><span className="text-sm text-muted">{m.aulas.length} aulas</span></div>
                {m.aulas.map((a) => (
                  <div key={a} className="lesson bg-bg">
                    <span className="text-muted"><Icon name="grip" size={18} /></span>
                    <span className="min-w-0 flex-1">{a}</span>
                    {a === SEM_VIDEO ? <span className="tag tag-warn">Sem vídeo</span> : <span className="flex items-center gap-2 text-sm text-muted"><Icon name="video" size={16} /><span>Vídeo enviado</span></span>}
                  </div>
                ))}
                <button className="lesson dash" type="button"><Icon name="plus" size={18} />Adicionar aula</button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </AppShell>
  );
}
