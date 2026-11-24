// Modo de exemplo (site no GitHub Pages, sem API): imita as respostas da API com
// dados na memória da página. Nada é salvo; ao recarregar, tudo volta ao início.
import { ApiErro } from './erro';
import { MODULOS, wa } from './site';
import type { ApiProduto, AulaAdmin, Pedido, Status, Usuaria } from './tipos';

const hora = 3_600_000;
const ha = (h: number) => new Date(Date.now() - h * hora).toISOString();

const PRODUTO_BASE = { publicado: true, itens: [] as string[], temArquivo: false, categoria: 'cilios' as const };

let produtos: ApiProduto[] = [
  {
    ...PRODUTO_BASE, id: 'p-cilios-presencial', slug: 'extensao-de-cilios-presencial', tipo: 'curso', formato: 'presencial', ordem: 1,
    titulo: 'Extensão de Cílios — Iniciante', capa: '/fotos/pdf-curso-p3-03.jpg',
    resumo: 'Intensivo de 2 dias em Osasco: cinco técnicas, kit com 20 itens, apostila e prática com modelo.',
    descricao: 'Intensivo de 2 dias: teoria, treino e prática com modelo real.',
    preco: 100000, precoOriginal: 120000, desconto: 17, condicoes: 'à vista ou em até 12x', cargaHoraria: '2 dias', nivel: 'Iniciante', local: 'Osasco-SP',
  },
  {
    ...PRODUTO_BASE, id: 'p-cilios-online', slug: 'extensao-de-cilios-online', tipo: 'curso', formato: 'online', ordem: 2,
    titulo: 'Extensão de Cílios — Iniciante', capa: '/fotos/post-04.jpg',
    resumo: 'As mesmas cinco técnicas em 12 aulas gravadas, com apostila e certificado.',
    preco: 49700, condicoes: 'à vista ou em até 12x', cargaHoraria: '12 aulas', nivel: 'Iniciante',
  },
  {
    ...PRODUTO_BASE, id: 'p-sobrancelhas', slug: 'design-de-sobrancelhas-presencial', tipo: 'curso', formato: 'presencial', ordem: 3, categoria: 'sobrancelhas',
    titulo: 'Design de Sobrancelhas', capa: '/fotos/post-12.jpg',
    resumo: 'Mapeamento, desenho e acabamento sob medida. Próximas turmas pelo WhatsApp.',
    preco: 60000, condicoes: 'à vista ou em até 12x', cargaHoraria: '1 dia', local: 'Osasco-SP',
  },
  {
    ...PRODUTO_BASE, id: 'p-apostila', slug: 'apostila-extensao-de-cilios', tipo: 'apostila', ordem: 4,
    titulo: 'Apostila Profissional de Extensão de Cílios', capa: '/fotos/pdf-apostila-p1-07.jpg',
    resumo: 'Biossegurança, tipos de técnica, ciclo dos fios e mapeamento em 30 páginas.',
    preco: 9700, paginas: 30, temArquivo: true,
  },
];

type UsuariaDemo = Usuaria;
let usuarias: UsuariaDemo[] = [
  { id: 'u-camilla', nome: 'Camilla Gama', email: 'camilla@example.com', whatsapp: '11947692668', papel: 'admin' },
  { id: 'u-ana', nome: 'Ana Souza', email: 'ana@exemplo.com', whatsapp: '11900000001', papel: 'aluna' },
  { id: 'u-bruna', nome: 'Bruna Lima', email: 'bruna@exemplo.com', whatsapp: '11900000002', papel: 'aluna' },
  { id: 'u-larissa', nome: 'Larissa Alves', email: 'larissa@exemplo.com', whatsapp: '11900000003', papel: 'aluna' },
  { id: 'u-patricia', nome: 'Patrícia Santos', email: 'patricia@exemplo.com', whatsapp: '11900000004', papel: 'aluna' },
];

type PedidoDemo = { id: string; userId: string; productId: string; status: Status; solicitadaEm: string; liberadaEm?: string; canceladaEm?: string; dataTurma?: string; expiraEm?: string; observacao?: string };
let pedidos: PedidoDemo[] = [
  { id: 'e1', userId: 'u-ana', productId: 'p-sobrancelhas', status: 'pendente', solicitadaEm: ha(2) },
  { id: 'e2', userId: 'u-bruna', productId: 'p-cilios-presencial', status: 'pendente', solicitadaEm: ha(6) },
  { id: 'e3', userId: 'u-larissa', productId: 'p-apostila', status: 'pendente', solicitadaEm: ha(20) },
  { id: 'e4', userId: 'u-patricia', productId: 'p-cilios-online', status: 'ativa', solicitadaEm: ha(24 * 14), liberadaEm: ha(24 * 14) },
  { id: 'e5', userId: 'u-ana', productId: 'p-cilios-online', status: 'ativa', solicitadaEm: ha(24 * 20), liberadaEm: ha(24 * 20) },
  { id: 'e6', userId: 'u-ana', productId: 'p-apostila', status: 'ativa', solicitadaEm: ha(24 * 20), liberadaEm: ha(24 * 20) },
  { id: 'e7', userId: 'u-ana', productId: 'p-cilios-presencial', status: 'ativa', solicitadaEm: ha(24 * 30), liberadaEm: ha(24 * 29) },
];

const DESCRICOES: Record<string, string> = {
  'Ciclo de vida dos cílios':
    'Os fios passam pelas fases anágena, catágena e telógena, e perdemos naturalmente de 3 a 5 por dia. Entender esse ciclo explica por que as manutenções são necessárias e por que cada cliente tem o seu tempo.',
};
let n = 0;
let modulos = MODULOS.map((m, i) => ({
  id: `m${i + 1}`,
  courseId: 'p-cilios-online',
  titulo: m.nome,
  ordem: i,
  aulas: m.aulas.map((t, j): AulaAdmin => ({
    id: `a${++n}`,
    titulo: t,
    descricao: DESCRICOES[t],
    ordem: j,
    ...(t === 'Volume Europeu (4D)' ? {} : { videoProvider: 'bunny' as const, videoId: `exemplo-${n}` }),
    materiais: DESCRICOES[t] ? [{ nome: 'Apostila — página 8: ciclo de vida dos cílios', arquivo: 'exemplo.pdf' }] : [],
  })),
}));
const progresso = new Map<string, boolean>([['u-ana:a1', true], ['u-ana:a2', true], ['u-ana:a3', true]]);

// ---------- Regras (iguais às da API) ----------

const desconto = (preco: number, original?: number) => (original && original > preco ? Math.round((1 - preco / original) * 100) : undefined);
const produto = (id: string) => produtos.find((p) => p.id === id);
const usuaria = (id: string) => usuarias.find((u) => u.id === id);
const resumoProduto = (p: ApiProduto) => ({ id: p.id, titulo: p.titulo, slug: p.slug, tipo: p.tipo, formato: p.formato, capa: p.capa, preco: p.preco });
const temAcesso = (userId: string, productId: string) =>
  pedidos.some((e) => e.userId === userId && e.status === 'ativa' && (!e.expiraEm || e.expiraEm > new Date().toISOString()) && (e.productId === productId || produto(e.productId)?.itens.includes(productId)));
const formatar = (e: PedidoDemo): Pedido => {
  const p = produto(e.productId)!;
  return { ...e, produto: resumoProduto(p), vencida: Boolean(e.expiraEm && e.expiraEm < new Date().toISOString()) };
};
const comAluna = (e: PedidoDemo) => {
  const u = usuaria(e.userId)!;
  return { ...formatar(e), aluna: { id: u.id, nome: u.nome, email: u.email, whatsapp: u.whatsapp, whatsappUrl: wa(undefined, u.whatsapp) } };
};
const aulasDoCurso = (courseId: string) => modulos.filter((m) => m.courseId === courseId).flatMap((m) => m.aulas);
const tokens = (u: Usuaria) => ({ usuaria: u, accessToken: 'exemplo', refreshToken: 'exemplo' });

function pedir(userId: string, productId: string) {
  const p = produto(productId);
  if (!p || !p.publicado) throw new ApiErro(404, 'Produto não encontrado.');
  if (temAcesso(userId, productId)) throw new ApiErro(409, 'Você já tem acesso a este produto.');
  let e = pedidos.find((x) => x.userId === userId && x.productId === productId);
  if (!e) pedidos.unshift((e = { id: `e${Date.now()}`, userId, productId, status: 'pendente', solicitadaEm: new Date().toISOString() }));
  else Object.assign(e, { status: 'pendente', solicitadaEm: new Date().toISOString(), canceladaEm: undefined });
  const u = usuaria(userId)!;
  return { pedido: formatar(e), whatsappUrl: wa(`Olá, Camilla! Sou ${u.nome} e acabei de pedir: ${p.titulo}${p.formato ? ` (${p.formato})` : ''}. Como faço o pagamento?`) };
}

function novaUsuaria(d: { nome: string; email: string; whatsapp: string }) {
  const email = d.email.trim().toLowerCase();
  if (usuarias.some((u) => u.email === email)) throw new ApiErro(409, 'Já existe uma conta com este e-mail. Entre com sua senha.');
  const u: Usuaria = { id: `u${Date.now()}`, nome: d.nome.trim(), email, whatsapp: d.whatsapp.replace(/\D/g, ''), papel: 'aluna', criadoEm: new Date().toISOString() };
  usuarias.push(u);
  return u;
}

function eu(s?: Usuaria) {
  if (!s) throw new ApiErro(401, 'Entre na sua conta.');
  return usuaria(s.id) ?? (usuarias.push(s), s);
}

function admin(s?: Usuaria) {
  const u = eu(s);
  if (u.papel !== 'admin') throw new ApiErro(403, 'Só a instrutora acessa o painel.');
  return u;
}

function lista<T>(itens: T[], q: URLSearchParams) {
  const pagina = Number(q.get('pagina') ?? 1);
  const porPagina = Number(q.get('porPagina') ?? 20);
  return { itens: itens.slice((pagina - 1) * porPagina, pagina * porPagina), total: itens.length, pagina, porPagina };
}

const busca = (q: URLSearchParams) => {
  const b = q.get('busca')?.trim().toLowerCase();
  const dig = b?.replace(/\D/g, '') ?? '';
  return (u: { nome: string; email: string; whatsapp: string }) =>
    !b || u.nome.toLowerCase().includes(b) || u.email.includes(b) || (dig.length >= 4 && u.whatsapp.includes(dig));
};

const SEM_ARQUIVO = 'Na versão de teste não há arquivos para baixar.';

// ---------- Rotas ----------

type Corpo = Record<string, any>;
type Rota = [string, RegExp, (m: string[], corpo: Corpo, q: URLSearchParams, s?: Usuaria) => unknown];

const ROTAS: Rota[] = [
  // Conta
  ['POST', /^\/auth\/login$/, (_, c) => {
    const email = String(c.email ?? '').trim().toLowerCase();
    let u = usuarias.find((x) => x.email === email);
    if (!u && /camilla|admin/.test(email)) u = usuarias[0];
    u ??= novaUsuaria({ nome: email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Aluna', email, whatsapp: '11900000000' });
    return tokens(u);
  }],
  ['POST', /^\/auth\/logout$/, () => undefined],
  ['GET', /^\/auth\/me$/, (_, __, ___, s) => eu(s)],
  ['POST', /^\/auth\/esqueci-senha$/, (_, c) => ({
    mensagem: 'Se o e-mail tiver conta, a Camilla pode te mandar o link para criar uma senha nova. Fale com ela no WhatsApp.',
    whatsappUrl: wa(`Olá! Esqueci a senha da área da aluna. Meu e-mail é ${c.email}.`),
  })],
  ['POST', /^\/auth\/redefinir-senha$/, () => undefined],

  // Público
  ['GET', /^\/produtos$/, () => produtos.filter((p) => p.publicado).sort((a, b) => a.ordem - b.ordem)],
  ['POST', /^\/inscricoes$/, (_, c) => {
    if (!produto(c.productId)?.publicado) throw new ApiErro(404, 'Produto não encontrado.');
    const u = novaUsuaria(c as never);
    return { ...tokens(u), ...pedir(u.id, c.productId) };
  }],
  ['GET', /^\/aulas\/([^/]+)\/video$/, () => {
    throw new ApiErro(404, 'Na versão de teste as aulas não têm vídeo.');
  }],

  // Aluna
  ['POST', /^\/aluna\/pedidos$/, (_, c, __, s) => pedir(eu(s).id, c.productId)],
  ['GET', /^\/aluna\/pedidos$/, (_, __, ___, s) => {
    const u = eu(s);
    return pedidos
      .filter((e) => e.userId === u.id)
      .map((e) => {
        const f = formatar(e);
        const aulas = aulasDoCurso(e.productId);
        if (e.status !== 'ativa' || !aulas.length) return f;
        const feitas = aulas.filter((a) => progresso.get(`${u.id}:${a.id}`)).length;
        return { ...f, progresso: { concluidas: feitas, total: aulas.length, percentual: Math.round((feitas / aulas.length) * 100) } };
      });
  }],
  ['GET', /^\/aluna\/produtos$/, (_, __, ___, s) => {
    const u = eu(s);
    return produtos.filter((p) => p.tipo !== 'combo' && temAcesso(u.id, p.id)).sort((a, b) => a.ordem - b.ordem);
  }],
  ['GET', /^\/aluna\/cursos\/([^/]+)$/, ([, slug], _, __, s) => {
    const u = eu(s);
    const p = produtos.find((x) => x.slug === slug);
    if (!p) throw new ApiErro(404, 'Produto não encontrado.');
    if (!temAcesso(u.id, p.id)) throw new ApiErro(403, 'Seu acesso a este curso ainda não foi liberado.');
    const mods = modulos
      .filter((m) => m.courseId === p.id)
      .map((m) => ({
        id: m.id,
        titulo: m.titulo,
        aulas: m.aulas.map((a) => ({ id: a.id, titulo: a.titulo, descricao: a.descricao, duracao: a.duracao, aulaGratis: a.aulaGratis, materiais: a.materiais.map((x) => x.nome), concluida: Boolean(progresso.get(`${u.id}:${a.id}`)), ultimoSegundo: 0 })),
      }));
    const todas = mods.flatMap((m) => m.aulas);
    const feitas = todas.filter((a) => a.concluida).length;
    return {
      produto: p,
      modulos: mods,
      progresso: { concluidas: feitas, total: todas.length, percentual: todas.length ? Math.round((feitas / todas.length) * 100) : 0 },
      proximaAulaId: todas.find((a) => !a.concluida)?.id ?? todas[0]?.id ?? null,
    };
  }],
  ['PUT', /^\/aluna\/progresso\/([^/]+)$/, ([, id], c, __, s) => {
    const u = eu(s);
    if (c.concluida !== undefined) progresso.set(`${u.id}:${id}`, Boolean(c.concluida));
    return { aulaId: id, concluida: Boolean(progresso.get(`${u.id}:${id}`)), ultimoSegundo: c.ultimoSegundo ?? 0 };
  }],
  ['GET', /^\/aluna\/produtos\/([^/]+)\/download$/, () => {
    throw new ApiErro(400, SEM_ARQUIVO);
  }],
  ['GET', /^\/aluna\/aulas\/([^/]+)\/materiais\/(\d+)$/, () => {
    throw new ApiErro(400, SEM_ARQUIVO);
  }],
  ['PATCH', /^\/aluna\/perfil$/, (_, c, __, s) => Object.assign(eu(s), { nome: c.nome ?? s!.nome, whatsapp: c.whatsapp?.replace(/\D/g, '') ?? s!.whatsapp })],
  ['PUT', /^\/aluna\/senha$/, () => undefined],

  // Painel
  ['GET', /^\/admin\/resumo$/, (_, __, ___, s) => {
    admin(s);
    return {
      pedidosPendentes: pedidos.filter((e) => e.status === 'pendente').length,
      acessosAtivos: pedidos.filter((e) => e.status === 'ativa').length,
      alunasAtivas: new Set(pedidos.filter((e) => e.status === 'ativa').map((e) => e.userId)).size,
      produtosPublicados: produtos.filter((p) => p.publicado).length,
      contatosNaoAtendidos: 0,
      pendentesRecentes: pedidos.filter((e) => e.status === 'pendente').slice(0, 5).map(comAluna),
    };
  }],
  ['GET', /^\/admin\/pedidos$/, (_, __, q, s) => {
    admin(s);
    const st = q.get('status');
    const filtro = busca(q);
    const itens = pedidos
      .filter((e) => (!st || e.status === st) && filtro(usuaria(e.userId)!))
      .sort((a, b) => b.solicitadaEm.localeCompare(a.solicitadaEm))
      .map(comAluna);
    const porStatus = Object.fromEntries((['pendente', 'ativa', 'cancelada'] as const).map((x) => [x, pedidos.filter((e) => e.status === x).length]));
    return { ...lista(itens, q), porStatus };
  }],
  ['POST', /^\/admin\/pedidos\/([^/]+)\/liberar$/, ([, id], c, __, s) => {
    admin(s);
    const e = pedidos.find((x) => x.id === id);
    if (!e) throw new ApiErro(404, 'Pedido não encontrado.');
    Object.assign(e, { status: 'ativa', liberadaEm: new Date().toISOString(), canceladaEm: undefined, ...(c.dataTurma ? { dataTurma: c.dataTurma } : {}), ...(c.expiraEm ? { expiraEm: c.expiraEm } : {}) });
    return formatar(e);
  }],
  ['POST', /^\/admin\/pedidos\/([^/]+)\/cancelar$/, ([, id], _, __, s) => {
    admin(s);
    const e = pedidos.find((x) => x.id === id);
    if (!e) throw new ApiErro(404, 'Pedido não encontrado.');
    Object.assign(e, { status: 'cancelada', canceladaEm: new Date().toISOString() });
    return formatar(e);
  }],
  ['PATCH', /^\/admin\/pedidos\/([^/]+)$/, ([, id], c, __, s) => {
    admin(s);
    const e = pedidos.find((x) => x.id === id);
    if (!e) throw new ApiErro(404, 'Pedido não encontrado.');
    for (const k of ['dataTurma', 'expiraEm', 'observacao'] as const) if (k in c) e[k] = c[k] ?? undefined;
    return formatar(e);
  }],
  ['POST', /^\/admin\/pedidos$/, (_, c, __, s) => {
    admin(s);
    const userId = c.userId ?? novaUsuaria(c.aluna).id;
    let e = pedidos.find((x) => x.userId === userId && x.productId === c.productId);
    if (!e) pedidos.unshift((e = { id: `e${Date.now()}`, userId, productId: c.productId, status: 'ativa', solicitadaEm: new Date().toISOString() }));
    Object.assign(e, { status: 'ativa', liberadaEm: new Date().toISOString(), dataTurma: c.dataTurma, expiraEm: c.expiraEm });
    return { pedido: formatar(e), userId, linkSenha: c.aluna ? 'https://exemplo.com/redefinir-senha?token=exemplo' : undefined };
  }],
  ['GET', /^\/admin\/alunas$/, (_, __, q, s) => {
    admin(s);
    const filtro = busca(q);
    const itens = usuarias
      .filter((u) => u.papel === 'aluna' && filtro(u))
      .map((u) => {
        const c = (st: Status) => pedidos.filter((e) => e.userId === u.id && e.status === st).length;
        return { ...u, whatsappUrl: wa(undefined, u.whatsapp), pedidos: { pendente: c('pendente'), ativa: c('ativa'), cancelada: c('cancelada') } };
      });
    return lista(itens, q);
  }],
  ['GET', /^\/admin\/alunas\/([^/]+)$/, ([, id], _, __, s) => {
    admin(s);
    const u = usuaria(id);
    if (!u) throw new ApiErro(404, 'Aluna não encontrada.');
    return { ...u, whatsappUrl: wa(undefined, u.whatsapp), pedidos: pedidos.filter((e) => e.userId === id).map(formatar) };
  }],
  ['POST', /^\/admin\/alunas\/([^/]+)\/link-senha$/, ([, id], _, __, s) => {
    admin(s);
    const u = usuaria(id);
    if (!u) throw new ApiErro(404, 'Aluna não encontrada.');
    const link = 'https://exemplo.com/redefinir-senha?token=exemplo';
    return { link, whatsappUrl: wa(`Oi, ${u.nome.split(' ')[0]}! Aqui está o link para criar sua senha da área da aluna (vale 1 hora): ${link}`, u.whatsapp) };
  }],
  ['GET', /^\/admin\/produtos$/, (_, __, ___, s) => (admin(s), [...produtos].sort((a, b) => a.ordem - b.ordem))],
  ['GET', /^\/admin\/produtos\/([^/]+)$/, ([, id], _, __, s) => {
    admin(s);
    const p = produto(id);
    if (!p) throw new ApiErro(404, 'Produto não encontrado.');
    return p;
  }],
  ['POST', /^\/admin\/produtos$/, (_, c, __, s) => {
    admin(s);
    const slug = c.slug || String(c.titulo).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + (c.formato ? `-${c.formato}` : '');
    if (produtos.some((p) => p.slug === slug)) throw new ApiErro(409, 'Já existe um produto com este slug.');
    const p: ApiProduto = { ...PRODUTO_BASE, publicado: false, ...c, id: `p${Date.now()}`, slug, ordem: produtos.length + 1 } as ApiProduto;
    p.desconto = desconto(p.preco, p.precoOriginal);
    produtos.push(p);
    return p;
  }],
  ['PATCH', /^\/admin\/produtos\/([^/]+)$/, ([, id], c, __, s) => {
    admin(s);
    const p = produto(id);
    if (!p) throw new ApiErro(404, 'Produto não encontrado.');
    for (const [k, v] of Object.entries(c)) {
      if (v === null) delete (p as Corpo)[k];
      else (p as Corpo)[k] = v;
    }
    p.desconto = desconto(p.preco, p.precoOriginal);
    p.temArquivo = Boolean(p.arquivo) || p.temArquivo;
    return p;
  }],
  ['DELETE', /^\/admin\/produtos\/([^/]+)$/, ([, id], _, __, s) => {
    admin(s);
    if (pedidos.some((e) => e.productId === id)) throw new ApiErro(409, 'Este produto já tem pedidos. Despublique em vez de apagar.');
    produtos = produtos.filter((p) => p.id !== id);
    return { ok: true };
  }],
  ['GET', /^\/admin\/produtos\/([^/]+)\/modulos$/, ([, id], _, __, s) => (admin(s), modulos.filter((m) => m.courseId === id))],
  ['POST', /^\/admin\/produtos\/([^/]+)\/modulos$/, ([, id], c, __, s) => {
    admin(s);
    const m = { id: `m${Date.now()}`, courseId: id, titulo: c.titulo, ordem: modulos.filter((x) => x.courseId === id).length, aulas: [] as AulaAdmin[] };
    modulos.push(m);
    return { id: m.id, titulo: m.titulo, ordem: m.ordem };
  }],
  ['PATCH', /^\/admin\/modulos\/([^/]+)$/, ([, id], c, __, s) => {
    admin(s);
    const m = modulos.find((x) => x.id === id);
    if (!m) throw new ApiErro(404, 'Módulo não encontrado.');
    if (c.titulo) m.titulo = c.titulo;
    return { id: m.id, titulo: m.titulo, ordem: m.ordem };
  }],
  ['DELETE', /^\/admin\/modulos\/([^/]+)$/, ([, id], _, __, s) => {
    admin(s);
    if (modulos.find((x) => x.id === id)?.aulas.length) throw new ApiErro(409, 'Apague ou mova as aulas deste módulo antes.');
    modulos = modulos.filter((m) => m.id !== id);
    return undefined;
  }],
  ['POST', /^\/admin\/modulos\/([^/]+)\/aulas$/, ([, id], c, __, s) => {
    admin(s);
    const m = modulos.find((x) => x.id === id);
    if (!m) throw new ApiErro(404, 'Módulo não encontrado.');
    const a = { materiais: [], ...c, id: `a${Date.now()}`, ordem: m.aulas.length } as unknown as AulaAdmin;
    m.aulas.push(a);
    return a;
  }],
  ['PATCH', /^\/admin\/aulas\/([^/]+)$/, ([, id], c, __, s) => {
    admin(s);
    const a = modulos.flatMap((m) => m.aulas).find((x) => x.id === id);
    if (!a) throw new ApiErro(404, 'Aula não encontrada.');
    for (const [k, v] of Object.entries(c)) (a as Corpo)[k] = v ?? undefined;
    return a;
  }],
  ['DELETE', /^\/admin\/aulas\/([^/]+)$/, ([, id], _, __, s) => {
    admin(s);
    for (const m of modulos) m.aulas = m.aulas.filter((a) => a.id !== id);
    return undefined;
  }],
  ['POST', /^\/admin\/uploads$/, (_, c, __, s) => {
    admin(s);
    const f = (c as unknown as FormData).get('arquivo') as File;
    return { chave: `exemplo/${f.name}`, url: URL.createObjectURL(f) };
  }],
];

export async function demo<T>(metodo: string, caminho: string, corpo: unknown, sessao?: Usuaria): Promise<T> {
  await new Promise((r) => setTimeout(r, 120));
  const [rota, qs] = caminho.split('?');
  const q = new URLSearchParams(qs);
  for (const [m, re, fn] of ROTAS) {
    const achou = m === metodo && rota.match(re);
    if (achou) {
      const r = fn([...achou], (corpo ?? {}) as Corpo, q, sessao);
      return (r === undefined ? r : structuredClone(r)) as T;
    }
  }
  throw new ApiErro(404, 'Não disponível na versão de teste.');
}

/** Catálogo publicado, para a primeira renderização das páginas no modo de exemplo. */
export const catalogoDemo = () => produtos.filter((p) => p.publicado).sort((a, b) => a.ordem - b.ordem);
