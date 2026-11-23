/**
 * Fluxo completo contra um MongoDB de teste (padrão: mongodb://localhost:27017/lash_test).
 * Suba o banco com `docker compose up -d` na raiz antes de rodar.
 */
import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Connection } from 'mongoose';
import request from 'supertest';

const dir = mkdtempSync(join(tmpdir(), 'lash-uploads-'));
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST ?? 'mongodb://localhost:27017/lash_test';
process.env.STORAGE_DRIVER = 'local';
process.env.STORAGE_DIR = dir;
process.env.API_URL = 'http://api.test';
process.env.BUNNY_LIBRARY_ID = '123';
process.env.BUNNY_TOKEN_KEY = 'chave-bunny';

// Importado depois das variáveis, que são lidas ao montar o módulo.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../src/app.module');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { configurar } = require('../src/setup');

describe('API Camilla Lash', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let admin: string;
  let aluna: string;
  let alunaRefresh: string;
  const ids: Record<string, string> = {};

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    configurar(app);
    await app.init();
    const db = app.get<Connection>(getConnectionToken());
    await db.dropDatabase();
    await Promise.all(Object.values(db.models).map((m) => m.syncIndexes()));
    await db.collection('users').insertOne({
      nome: 'Camilla Gama', email: 'camilla@teste.com', whatsapp: '11947692668', papel: 'admin',
      senhaHash: await hash('senha-admin-1'), tokenVersao: 0, criadoEm: new Date(),
    });
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app?.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('health responde com o banco conectado', async () => {
    const r = await http.get('/api/health').expect(200);
    expect(r.body).toEqual({ ok: true, banco: 'conectado' });
  });

  it('admin entra; senha errada é recusada', async () => {
    await http.post('/api/auth/login').send({ email: 'camilla@teste.com', senha: 'errada123' }).expect(401);
    const r = await http.post('/api/auth/login').send({ email: 'CAMILLA@teste.com ', senha: 'senha-admin-1' }).expect(200);
    expect(r.body.usuaria.papel).toBe('admin');
    expect(String(r.headers['set-cookie'])).toMatch(/access_token=.*HttpOnly/);
    admin = r.body.accessToken;
  });

  it('admin cadastra produtos, grade e arquivo', async () => {
    const curso = await http.post('/api/admin/produtos').set(auth(admin)).send({
      tipo: 'curso', formato: 'online', categoria: 'cilios', titulo: 'Extensão de Cílios Online', preco: 49700, precoOriginal: 59700, publicado: true,
    }).expect(201);
    expect(curso.body.slug).toBe('extensao-de-cilios-online');
    expect(curso.body.desconto).toBe(17);
    ids.curso = curso.body.id;

    await http.post('/api/admin/produtos').set(auth(admin)).send({ tipo: 'curso', categoria: 'cilios', titulo: 'Sem formato', preco: 1 }).expect(400);
    await http.post('/api/admin/produtos').set(auth(admin)).send({ tipo: 'curso', formato: 'online', categoria: 'cilios', titulo: 'Extensão de Cílios Online', preco: 1 }).expect(409);

    const up = await http.post('/api/admin/uploads').set(auth(admin)).attach('arquivo', Buffer.from('%PDF-1.4 apostila'), 'Apostila Cílios.pdf').expect(201);
    expect(up.body.chave).toMatch(/^privado\/.+-apostila-cilios\.pdf$/);
    expect(up.body.url).toBeUndefined();

    const apostila = await http.post('/api/admin/produtos').set(auth(admin)).send({
      tipo: 'apostila', categoria: 'cilios', titulo: 'Apostila Profissional', preco: 9700, paginas: 30, arquivo: up.body.chave, publicado: true,
    }).expect(201);
    ids.apostila = apostila.body.id;

    const rascunho = await http.post('/api/admin/produtos').set(auth(admin)).send({ tipo: 'apostila', categoria: 'cilios', titulo: 'Rascunho', preco: 100 }).expect(201);
    ids.rascunho = rascunho.body.id;

    const combo = await http.post('/api/admin/produtos').set(auth(admin)).send({
      tipo: 'combo', categoria: 'cilios', titulo: 'Combo Curso + Apostila', preco: 54900, itens: [ids.curso, ids.apostila], publicado: true,
    }).expect(201);
    ids.combo = combo.body.id;

    const mod = await http.post(`/api/admin/produtos/${ids.curso}/modulos`).set(auth(admin)).send({ titulo: 'Fundamentos' }).expect(201);
    const a1 = await http.post(`/api/admin/modulos/${mod.body.id}/aulas`).set(auth(admin)).send({ titulo: 'Biossegurança', videoProvider: 'bunny', videoId: 'vid-1', duracao: 600, aulaGratis: true }).expect(201);
    const a2 = await http.post(`/api/admin/modulos/${mod.body.id}/aulas`).set(auth(admin)).send({
      titulo: 'Ciclo dos fios', videoProvider: 'bunny', videoId: 'vid-2', duracao: 900, materiais: [{ nome: 'Resumo', arquivo: up.body.chave }],
    }).expect(201);
    expect(a2.body.ordem).toBe(1);
    ids.aulaGratis = a1.body.id;
    ids.aula = a2.body.id;

    // Edição parcial não apaga o que não veio
    const ed = await http.patch(`/api/admin/aulas/${ids.aula}`).set(auth(admin)).send({ titulo: 'Ciclo de vida dos fios' }).expect(200);
    expect(ed.body).toMatchObject({ titulo: 'Ciclo de vida dos fios', videoId: 'vid-2', duracao: 900 });
    const edp = await http.patch(`/api/admin/produtos/${ids.curso}`).set(auth(admin)).send({ resumo: 'Online' }).expect(200);
    expect(edp.body).toMatchObject({ resumo: 'Online', preco: 49700, precoOriginal: 59700, publicado: true });

    // Grade só para curso online
    await http.post(`/api/admin/produtos/${ids.apostila}/modulos`).set(auth(admin)).send({ titulo: 'x' }).expect(400);
  });

  it('catálogo público mostra só publicados, sem arquivo nem vídeo', async () => {
    const r = await http.get('/api/produtos').expect(200);
    const slugs = r.body.map((p: any) => p.slug);
    expect(slugs).toEqual(expect.arrayContaining(['extensao-de-cilios-online', 'apostila-profissional', 'combo-curso-apostila']));
    expect(slugs).not.toContain('rascunho');
    const ap = r.body.find((p: any) => p.slug === 'apostila-profissional');
    expect(ap.arquivo).toBeUndefined();
    expect(ap.temArquivo).toBe(true);

    const filtro = await http.get('/api/produtos?tipo=apostila').expect(200);
    expect(filtro.body).toHaveLength(1);

    const curso = await http.get('/api/produtos/extensao-de-cilios-online').expect(200);
    expect(curso.body.modulos[0].aulas).toHaveLength(2);
    expect(JSON.stringify(curso.body)).not.toContain('vid-');

    await http.get('/api/produtos/rascunho').expect(404);
    const combo = await http.get('/api/produtos/combo-curso-apostila').expect(200);
    expect(combo.body.itensDetalhe).toHaveLength(2);
  });

  it('inscrição cria conta + pedido pendente e devolve o WhatsApp', async () => {
    const dados = { nome: 'Juliana Souza', email: 'ju@teste.com', whatsapp: '(11) 91234-5678', senha: 'senha-aluna-1', productId: ids.curso };
    const r = await http.post('/api/inscricoes').send(dados).expect(201);
    expect(r.body.usuaria.whatsapp).toBe('11912345678');
    expect(r.body.pedido.status).toBe('pendente');
    expect(r.body.whatsappUrl).toMatch(/^https:\/\/wa\.me\/5511947692668\?text=/);
    expect(decodeURIComponent(r.body.whatsappUrl)).toContain('Extensão de Cílios Online');
    aluna = r.body.accessToken;
    alunaRefresh = r.body.refreshToken;

    await http.post('/api/inscricoes').send(dados).expect(409);
    await http.post('/api/inscricoes').send({ ...dados, email: 'outra@teste.com', productId: ids.rascunho }).expect(404);
    await http.post('/api/inscricoes').send({ ...dados, email: 'x@teste.com', senha: '123' }).expect(400);
    await http.post('/api/inscricoes').send({ ...dados, email: 'y@teste.com', papel: 'admin' }).expect(400);

    // Pedir de novo devolve o mesmo pedido
    const de_novo = await http.post('/api/aluna/pedidos').set(auth(aluna)).send({ productId: ids.curso }).expect(201);
    expect(de_novo.body.pedido.id).toBe(r.body.pedido.id);
  });

  it('pendente: sem acesso ao curso, ao vídeo e ao download; aula grátis liberada', async () => {
    await http.get('/api/aluna/cursos/extensao-de-cilios-online').set(auth(aluna)).expect(403);
    await http.get(`/api/aulas/${ids.aula}/video`).set(auth(aluna)).expect(403);
    await http.get(`/api/aulas/${ids.aula}/video`).expect(403);
    await http.get(`/api/aluna/produtos/${ids.apostila}/download`).set(auth(aluna)).expect(403);
    await http.put(`/api/aluna/progresso/${ids.aula}`).set(auth(aluna)).send({ concluida: true }).expect(403);

    const gratis = await http.get(`/api/aulas/${ids.aulaGratis}/video`).expect(200);
    expect(gratis.body.embedUrl).toMatch(/^https:\/\/iframe\.mediadelivery\.net\/embed\/123\/vid-1\?token=[a-f0-9]{64}&expires=\d+$/);

    const meus = await http.get('/api/aluna/pedidos').set(auth(aluna)).expect(200);
    expect(meus.body).toHaveLength(1);
    expect(meus.body[0].status).toBe('pendente');
  });

  it('aluna e visitante não entram no painel', async () => {
    await http.get('/api/admin/pedidos').set(auth(aluna)).expect(403);
    await http.get('/api/admin/pedidos').expect(401);
    await http.post('/api/admin/uploads').set(auth(aluna)).attach('arquivo', Buffer.from('x'), 'x.pdf').expect(403);
  });

  it('admin lista, busca e libera o pedido', async () => {
    const r = await http.get('/api/admin/pedidos?status=pendente&busca=juliana').set(auth(admin)).expect(200);
    expect(r.body.total).toBe(1);
    expect(r.body.itens[0].aluna.whatsappUrl).toBe('https://wa.me/5511912345678');
    expect(r.body.porStatus.pendente).toBe(1);

    const porTel = await http.get('/api/admin/pedidos?busca=91234').set(auth(admin)).expect(200);
    expect(porTel.body.total).toBe(1);

    const lib = await http.post(`/api/admin/pedidos/${r.body.itens[0].id}/liberar`).set(auth(admin)).send({}).expect(200);
    expect(lib.body.status).toBe('ativa');
    expect(lib.body.liberadaEm).toBeTruthy();

    const resumo = await http.get('/api/admin/resumo').set(auth(admin)).expect(200);
    expect(resumo.body).toMatchObject({ pedidosPendentes: 0, acessosAtivos: 1, alunasAtivas: 1 });
  });

  it('liberada: curso, vídeo, progresso e material', async () => {
    const c = await http.get('/api/aluna/cursos/extensao-de-cilios-online').set(auth(aluna)).expect(200);
    expect(c.body.progresso).toEqual({ concluidas: 0, total: 2, percentual: 0 });
    expect(c.body.proximaAulaId).toBe(ids.aulaGratis);

    const v = await http.get(`/api/aulas/${ids.aula}/video`).set(auth(aluna)).expect(200);
    expect(v.body.embedUrl).toContain('/vid-2?token=');

    await http.put(`/api/aluna/progresso/${ids.aulaGratis}`).set(auth(aluna)).send({ concluida: true }).expect(200);
    const p = await http.put(`/api/aluna/progresso/${ids.aula}`).set(auth(aluna)).send({ ultimoSegundo: 120 }).expect(200);
    expect(p.body).toMatchObject({ concluida: false, ultimoSegundo: 120 });

    const c2 = await http.get('/api/aluna/cursos/extensao-de-cilios-online').set(auth(aluna)).expect(200);
    expect(c2.body.progresso.percentual).toBe(50);
    expect(c2.body.proximaAulaId).toBe(ids.aula);
    expect(c2.body.modulos[0].aulas[1].ultimoSegundo).toBe(120);

    const meus = await http.get('/api/aluna/pedidos').set(auth(aluna)).expect(200);
    expect(meus.body[0].progresso).toEqual({ concluidas: 1, total: 2, percentual: 50 });

    const m = await http.get(`/api/aluna/aulas/${ids.aula}/materiais/0`).set(auth(aluna)).expect(200);
    const caminho = m.body.url.replace('http://api.test', '');
    const arq = await http.get(caminho).expect(200);
    expect(arq.headers['content-disposition']).toContain('Resumo.pdf');
    await http.get('/api/arquivos/download/token-falso').expect(404);
  });

  it('combo libera os itens (download da apostila)', async () => {
    await http.get(`/api/aluna/produtos/${ids.apostila}/download`).set(auth(aluna)).expect(403);
    const users = await http.get('/api/admin/alunas?busca=ju@teste').set(auth(admin)).expect(200);
    const userId = users.body.itens[0].id;
    await http.post('/api/admin/pedidos').set(auth(admin)).send({ userId, productId: ids.combo }).expect(201);

    const d = await http.get(`/api/aluna/produtos/${ids.apostila}/download`).set(auth(aluna)).expect(200);
    const arq = await http.get(d.body.url.replace('http://api.test', '')).expect(200);
    expect(arq.text ?? arq.body.toString()).toContain('%PDF-1.4');

    const liberados = await http.get('/api/aluna/produtos').set(auth(aluna)).expect(200);
    expect(liberados.body.map((p: any) => p.id).sort()).toEqual([ids.curso, ids.apostila].sort());
  });

  it('cancelar tira o acesso; pedir de novo reabre como pendente', async () => {
    const lista = await http.get(`/api/admin/pedidos?productId=${ids.curso}`).set(auth(admin)).expect(200);
    const id = lista.body.itens[0].id;
    await http.post(`/api/admin/pedidos/${id}/cancelar`).set(auth(admin)).expect(200);
    // Ainda tem acesso pelo combo
    await http.get('/api/aluna/cursos/extensao-de-cilios-online').set(auth(aluna)).expect(200);

    const comboPedido = await http.get(`/api/admin/pedidos?productId=${ids.combo}`).set(auth(admin)).expect(200);
    await http.post(`/api/admin/pedidos/${comboPedido.body.itens[0].id}/cancelar`).set(auth(admin)).expect(200);
    await http.get('/api/aluna/cursos/extensao-de-cilios-online').set(auth(aluna)).expect(403);

    const r = await http.post('/api/aluna/pedidos').set(auth(aluna)).send({ productId: ids.curso }).expect(201);
    expect(r.body.pedido).toMatchObject({ id, status: 'pendente' });
  });

  it('admin cadastra aluna nova com link de senha; a aluna cria a senha e entra', async () => {
    const r = await http.post('/api/admin/pedidos').set(auth(admin)).send({
      productId: ids.apostila, aluna: { nome: 'Maria Lima', email: 'maria@teste.com', whatsapp: '11955554444' },
    }).expect(201);
    expect(r.body.pedido.status).toBe('ativa');
    const token = new URL(r.body.linkSenha).searchParams.get('token')!;
    await http.post('/api/auth/redefinir-senha').send({ token, senha: 'nova-senha-1' }).expect(204);
    await http.post('/api/auth/redefinir-senha').send({ token, senha: 'outra-senha' }).expect(401);
    const login = await http.post('/api/auth/login').send({ email: 'maria@teste.com', senha: 'nova-senha-1' }).expect(200);
    await http.get(`/api/aluna/produtos/${ids.apostila}/download`).set(auth(login.body.accessToken)).expect(200);

    const link = await http.post(`/api/admin/alunas/${r.body.userId}/link-senha`).set(auth(admin)).expect(201);
    expect(link.body.whatsappUrl).toMatch(/^https:\/\/wa\.me\/5511955554444\?text=/);
  });

  it('refresh renova; logout invalida o refresh', async () => {
    const r = await http.post('/api/auth/refresh').send({ refreshToken: alunaRefresh }).expect(200);
    expect(r.body.accessToken).toBeTruthy();
    const me = await http.get('/api/auth/me').set(auth(r.body.accessToken)).expect(200);
    expect(me.body.email).toBe('ju@teste.com');
    await http.post('/api/auth/logout').set(auth(r.body.accessToken)).expect(204);
    await http.post('/api/auth/refresh').send({ refreshToken: alunaRefresh }).expect(401);
  });

  it('esqueci a senha responde igual para qualquer e-mail', async () => {
    const a = await http.post('/api/auth/esqueci-senha').send({ email: 'ju@teste.com' }).expect(200);
    const b = await http.post('/api/auth/esqueci-senha').send({ email: 'ninguem@teste.com' }).expect(200);
    expect(a.body.mensagem).toBe(b.body.mensagem);
  });

  it('contato da landing vai para o painel', async () => {
    await http.post('/api/leads').send({ nome: 'Ana', whatsapp: '11 98888-7777', interesse: 'Curso de sobrancelhas', origem: 'landing' }).expect(201);
    await http.post('/api/leads').send({ nome: 'Ana', whatsapp: '123' }).expect(400);
    const r = await http.get('/api/admin/leads').set(auth(admin)).expect(200);
    expect(r.body.total).toBe(1);
    const l = await http.patch(`/api/admin/leads/${r.body.itens[0].id}`).set(auth(admin)).send({ atendido: true }).expect(200);
    expect(l.body.atendido).toBe(true);
  });

  it('produto com pedidos não pode ser apagado; sem pedidos, pode', async () => {
    await http.delete(`/api/admin/produtos/${ids.curso}`).set(auth(admin)).expect(409);
    await http.delete(`/api/admin/produtos/${ids.rascunho}`).set(auth(admin)).expect(204);
    const ed = await http.patch(`/api/admin/produtos/${ids.curso}`).set(auth(admin)).send({ precoOriginal: null }).expect(200);
    expect(ed.body.precoOriginal).toBeUndefined();
    expect(ed.body.desconto).toBeNull();
  });
});
