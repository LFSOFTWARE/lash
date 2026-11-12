'use client';

// Partes com estado. Nesta versão de teste nada é salvo: tudo vive na memória da página.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icon';
import { Preco } from './Site';
import { PRODUTOS, WA } from '@/lib/site';
import { PrecoProduto } from './Produto';

const ONLINE = PRODUTOS.find((p) => p.id === 'cilios-online')!;

/** Formulário de demonstração: ao enviar, só navega para a próxima tela. */
export function FormDemo({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <form className={className} onSubmit={(e) => { e.preventDefault(); router.push(to); }}>
      {children}
    </form>
  );
}

/** Cartão de investimento da página do curso, com a escolha Presencial / Online. */
export function Investimento() {
  const [formato, setFormato] = useState<'presencial' | 'online'>('presencial');
  const presencial = formato === 'presencial';
  return (
    <div className="card flex flex-col gap-4 p-5 lg:p-8">
      <div className="seg" role="group" aria-label="Formato do curso">
        <button type="button" aria-pressed={presencial} onClick={() => setFormato('presencial')}><Icon name="map-pin" size={16} />Presencial</button>
        <button type="button" aria-pressed={!presencial} onClick={() => setFormato('online')}><Icon name="video" size={16} />Online</button>
      </div>
      <span className="t-label">Investimento · {formato}</span>
      <div aria-live="polite" className="flex flex-col gap-4">
        {presencial ? (
          <>
            <Preco size={44} sufixo="à vista" />
            <p className="text-sm text-muted">Ou em até 12x no cartão, com a taxa da maquininha. O pagamento é combinado pelo WhatsApp.</p>
          </>
        ) : (
          <>
            <PrecoProduto p={ONLINE} size={44} />
            <p className="text-sm text-muted">Aulas gravadas para assistir no seu ritmo. O pagamento é combinado pelo WhatsApp.</p>
          </>
        )}
      </div>
      <Link className="btn btn-pri btn-lg w-full" href="/inscricao">Quero me inscrever</Link>
      <a className="btn btn-sec btn-lg w-full" href={WA}><Icon name="whatsapp" size={18} />Tirar dúvidas</a>
      <ul className="checks border-t border-line pt-4 text-sm">
        {presencial ? (
          <>
            <li><Icon name="package" size={18} />Kit completo com 20&nbsp;itens</li>
            <li><Icon name="book" size={18} />Apostila exclusiva</li>
            <li><Icon name="award" size={18} />Certificado de conclusão</li>
            <li><Icon name="users" size={18} />Prática com modelo real</li>
          </>
        ) : (
          <>
            <li><Icon name="video" size={18} />12 aulas gravadas</li>
            <li><Icon name="book" size={18} />Apostila exclusiva</li>
            <li><Icon name="award" size={18} />Certificado de conclusão</li>
          </>
        )}
      </ul>
    </div>
  );
}

type Pedido = { ini: string; nome: string; email: string; item: string; fone: string; quando: string; liberado: boolean };
const INICIAIS: Pedido[] = [
  { ini: 'AS', nome: 'Ana Souza', email: 'ana@exemplo.com', item: 'Design de Sobrancelhas', fone: '(11) 90000-0001', quando: 'Hoje, 14:20', liberado: false },
  { ini: 'BL', nome: 'Bruna Lima', email: 'bruna@exemplo.com', item: 'Extensão de Cílios — Presencial', fone: '(11) 90000-0002', quando: 'Hoje, 10:05', liberado: false },
  { ini: 'LA', nome: 'Larissa Alves', email: 'larissa@exemplo.com', item: 'Apostila Profissional', fone: '(11) 90000-0003', quando: 'Ontem, 19:42', liberado: false },
  { ini: 'PS', nome: 'Patrícia Santos', email: 'patricia@exemplo.com', item: 'Extensão de Cílios — Online', fone: '(11) 90000-0004', quando: '9 de nov., 16:30', liberado: true },
];
const FILTROS = ['Pendentes', 'Liberados', 'Todos'] as const;

/** Lista de pedidos do painel: tabela no desktop, cartões no celular, com os mesmos dados. */
export function Pedidos() {
  const [pedidos, setPedidos] = useState(INICIAIS);
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Pendentes');
  const [busca, setBusca] = useState('');
  const pendentes = pedidos.filter((p) => !p.liberado).length;
  const liberar = (nome: string) => setPedidos((ps) => ps.map((p) => (p.nome === nome ? { ...p, liberado: true } : p)));
  const q = busca.trim().toLowerCase();
  const visiveis = pedidos.filter((p) => (filtro === 'Todos' || (filtro === 'Pendentes') === !p.liberado) && (!q || p.nome.toLowerCase().includes(q) || p.fone.includes(q)));

  const Status = ({ p }: { p: Pedido }) =>
    p.liberado ? <span className="tag tag-ok"><Icon name="check" size={14} />Liberado</span> : <span className="tag tag-warn">Pendente</span>;
  const Acoes = ({ p, cheio }: { p: Pedido; cheio?: boolean }) =>
    p.liberado ? (
      <Link className={`btn btn-sec ${cheio ? 'flex-1' : ''}`} href="/admin#alunas">Ver aluna</Link>
    ) : (
      <>
        <a className="icb icb-bd lg:h-11 lg:w-11" href={WA} aria-label={`Conversar com ${p.nome} no WhatsApp`}><Icon name="whatsapp" /></a>
        <button className={`btn btn-pri ${cheio ? 'flex-1' : ''}`} type="button" onClick={() => liberar(p.nome)}>Liberar acesso</button>
      </>
    );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {([['Aguardando liberação', pendentes], ['Liberados este mês', 8 + (3 - pendentes)], ['Alunas ativas', 24], ['Itens no catálogo', 4]] as const).map(([t, n]) => (
          <div key={t} className="card kpi flex flex-col gap-1 p-4 lg:p-6"><span className="t-label">{t}</span><b className="num" aria-live="polite">{n}</b></div>
        ))}
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
          {FILTROS.map((f) => (
            <button key={f} className={`tag tag-lk ${filtro === f ? 'tag-on' : ''}`} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
              {f}{f === 'Pendentes' ? ` · ${pendentes}` : ''}
            </button>
          ))}
        </div>
        <div className="find relative lg:w-[320px]">
          <label htmlFor="busca" className="sr">Buscar pedido</label>
          <input id="busca" type="search" name="busca" autoComplete="off" placeholder="Buscar por nome ou WhatsApp…" style={{ paddingLeft: 44 }} value={busca} onChange={(e) => setBusca(e.target.value)} />
          <span className="pointer-events-none absolute top-3.5 left-3.5 text-muted"><Icon name="search" /></span>
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="card p-8 text-center text-muted">Nenhum pedido aqui. Quando alguém se inscrever, ele aparece nesta lista.</p>
      ) : (
        <>
          <div className="card hidden overflow-hidden lg:block">
            <table className="list">
              <thead>
                <tr><th scope="col" className="pl-6">Aluna</th><th scope="col">Item</th><th scope="col">WhatsApp</th><th scope="col">Pedido em</th><th scope="col">Status</th><th scope="col"><span className="sr">Ações</span></th></tr>
              </thead>
              <tbody>
                {visiveis.map((p) => (
                  <tr key={p.nome}>
                    <td className="pl-6"><div className="flex items-center gap-3"><div className="ini" aria-hidden="true">{p.ini}</div><div className="flex flex-col"><b>{p.nome}</b><span className="text-sm text-muted">{p.email}</span></div></div></td>
                    <td style={{ whiteSpace: 'normal', minWidth: 150 }}>{p.item}</td>
                    <td className="num">{p.fone}</td>
                    <td className="num">{p.quando}</td>
                    <td><Status p={p} /></td>
                    <td className="pr-6"><div className="flex items-center justify-end gap-2"><Acoes p={p} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 lg:hidden">
            {visiveis.map((p) => (
              <li key={p.nome} className="card flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="ini" aria-hidden="true">{p.ini}</div>
                  <div className="flex min-w-0 flex-1 flex-col"><b>{p.nome}</b><span className="truncate text-sm text-muted">{p.email}</span></div>
                  <Status p={p} />
                </div>
                <span className="text-[15px]">{p.item}</span>
                <div className="num flex justify-between text-sm text-muted"><span>{p.fone}</span><span>{p.quando}</span></div>
                <div className="flex gap-2"><Acoes p={p} cheio /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
