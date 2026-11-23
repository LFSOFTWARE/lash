import { Body, Controller, ForbiddenException, Get, HttpCode, NotFoundException, Param, ParseIntPipe, Patch, Put, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { Sessao, Usuaria } from '../common/auth.decorators';
import { AuthGuard, SessaoOpcionalGuard } from '../common/auth.guard';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { Aula } from '../content/content.schema';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { Product, publicProduct } from '../products/product.schema';
import { ProductsService } from '../products/products.service';
import { StorageService } from '../storage/storage.service';
import { publicUser, User } from '../users/user.schema';
import { VideoService } from '../video/video.service';
import { PerfilDto, ProgressoDto, TrocarSenhaDto } from './aluna.dto';
import { Progresso } from './progress.schema';

const nomeArquivo = (titulo: string, chave: string) => `${titulo}${chave.match(/\.[a-z0-9]+$/)?.[0] ?? ''}`;

@ApiTags('área da aluna')
@Controller('aluna')
@UseGuards(AuthGuard)
export class AlunaController {
  constructor(
    private enrollments: EnrollmentsService,
    private products: ProductsService,
    private storage: StorageService,
    private auth: AuthService,
    @InjectModel(Aula.name) private aulas: Model<Aula>,
    @InjectModel(Progresso.name) private progresso: Model<Progresso>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private users: Model<User>,
  ) {}

  /** Meus cursos e apostilas: pedidos pendentes, acessos ativos e o progresso dos cursos online. */
  @Get('pedidos')
  async pedidos(@Usuaria() s: Sessao) {
    const lista = await this.enrollments.meus(s.id);
    const online = lista.filter((e) => e.status === 'ativa' && e.produto?.formato === 'online').map((e) => new Types.ObjectId(e.productId));
    const [totais, feitas] = await Promise.all([
      this.aulas.aggregate<{ _id: Types.ObjectId; n: number }>([{ $match: { courseId: { $in: online } } }, { $group: { _id: '$courseId', n: { $sum: 1 } } }]),
      this.progresso.aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { userId: new Types.ObjectId(s.id), courseId: { $in: online }, concluida: true } },
        { $group: { _id: '$courseId', n: { $sum: 1 } } },
      ]),
    ]);
    const total = new Map(totais.map((t) => [String(t._id), t.n]));
    const feito = new Map(feitas.map((t) => [String(t._id), t.n]));
    return lista.map((e) => {
      if (!total.has(e.productId)) return e;
      const t = total.get(e.productId)!;
      const f = feito.get(e.productId) ?? 0;
      return { ...e, progresso: { concluidas: f, total: t, percentual: Math.round((f / t) * 100) } };
    });
  }

  /** Itens de combos liberados aparecem como produtos liberados. */
  @Get('produtos')
  async liberados(@Usuaria() s: Sessao) {
    const ids = await this.enrollments.produtosLiberados(s.id);
    const ps = await this.productModel.find({ _id: { $in: ids }, tipo: { $ne: 'combo' } }).sort({ ordem: 1 });
    return ps.map((p) => publicProduct(p));
  }

  /** Curso online liberado: módulos, aulas, progresso de cada aula e a próxima a assistir. */
  @Get('cursos/:slug')
  async curso(@Usuaria() s: Sessao, @Param('slug') slug: string) {
    const p = await this.products.porSlug(slug, true);
    if (!(await this.enrollments.temAcesso(s.id, p._id))) throw new ForbiddenException('Seu acesso a este curso ainda não foi liberado.');
    const [modulos, prog] = await Promise.all([
      this.products.grade(p._id),
      this.progresso.find({ userId: s.id, courseId: p._id }).lean(),
    ]);
    const porAula = new Map(prog.map((x) => [String(x.lessonId), x]));
    const comProgresso = modulos.map((m) => ({
      ...m,
      aulas: m.aulas.map((a) => ({ ...a, concluida: porAula.get(a.id)?.concluida ?? false, ultimoSegundo: porAula.get(a.id)?.ultimoSegundo ?? 0 })),
    }));
    const todas = comProgresso.flatMap((m) => m.aulas);
    const concluidas = todas.filter((a) => a.concluida).length;
    return {
      produto: publicProduct(p),
      modulos: comProgresso,
      progresso: { concluidas, total: todas.length, percentual: todas.length ? Math.round((concluidas / todas.length) * 100) : 0 },
      proximaAulaId: todas.find((a) => !a.concluida)?.id ?? todas[0]?.id ?? null,
    };
  }

  /** Marca aula concluída e/ou salva a posição do vídeo. */
  @Put('progresso/:aulaId')
  async salvarProgresso(@Usuaria() s: Sessao, @Param('aulaId', ObjectIdPipe) aulaId: string, @Body() dto: ProgressoDto) {
    const a = await this.aulas.findById(aulaId).select('courseId aulaGratis').lean();
    if (!a) throw new NotFoundException('Aula não encontrada.');
    if (!(await this.enrollments.temAcesso(s.id, a.courseId))) throw new ForbiddenException('Seu acesso a este curso ainda não foi liberado.');
    const set: Partial<Progresso> = {};
    if (dto.concluida !== undefined) set.concluida = dto.concluida;
    if (dto.ultimoSegundo !== undefined) set.ultimoSegundo = dto.ultimoSegundo;
    const p = await this.progresso.findOneAndUpdate(
      { userId: s.id, lessonId: aulaId },
      { $set: set, $setOnInsert: { courseId: a.courseId } },
      { upsert: true, new: true },
    );
    return { aulaId, concluida: p.concluida, ultimoSegundo: p.ultimoSegundo };
  }

  /** Link temporário para baixar a apostila/planilha liberada. */
  @Get('produtos/:id/download')
  async baixarProduto(@Usuaria() s: Sessao, @Param('id', ObjectIdPipe) id: string) {
    const p = await this.products.porId(id);
    if (!p.arquivo) throw new NotFoundException('Este produto não tem arquivo.');
    if (!(await this.enrollments.temAcesso(s.id, p._id))) throw new ForbiddenException('Seu acesso ainda não foi liberado.');
    return { url: await this.storage.urlAssinada(p.arquivo, nomeArquivo(p.titulo, p.arquivo)) };
  }

  /** Link temporário para um material de aula. */
  @Get('aulas/:id/materiais/:i')
  async baixarMaterial(@Usuaria() s: Sessao, @Param('id', ObjectIdPipe) id: string, @Param('i', ParseIntPipe) i: number) {
    const a = await this.aulas.findById(id).lean();
    const m = a?.materiais[i];
    if (!a || !m) throw new NotFoundException('Material não encontrado.');
    if (!a.aulaGratis && !(await this.enrollments.temAcesso(s.id, a.courseId))) throw new ForbiddenException('Seu acesso ainda não foi liberado.');
    return { url: await this.storage.urlAssinada(m.arquivo, nomeArquivo(m.nome, m.arquivo)) };
  }

  @Patch('perfil')
  async perfil(@Usuaria() s: Sessao, @Body() dto: PerfilDto) {
    const u = await this.users.findByIdAndUpdate(s.id, { $set: dto }, { new: true });
    if (!u) throw new NotFoundException();
    return publicUser(u);
  }

  /** Troca a senha e encerra as outras sessões. */
  @Put('senha')
  @HttpCode(204)
  async senha(@Usuaria() s: Sessao, @Body() dto: TrocarSenhaDto) {
    const u = await this.users.findById(s.id).lean();
    if (!u) throw new NotFoundException();
    await this.auth.validar(u.email, dto.senhaAtual);
    await this.users.updateOne({ _id: s.id }, { senhaHash: await this.auth.hashSenha(dto.senhaNova), $inc: { tokenVersao: 1 } });
  }
}

/**
 * Player da aula. Regra central: o vídeo só sai para quem tem acesso ativo
 * ao curso, ou se a aula for gratuita. A checagem é aqui, não no front.
 */
@ApiTags('área da aluna')
@Controller('aulas')
@UseGuards(SessaoOpcionalGuard)
export class AulasController {
  constructor(private enrollments: EnrollmentsService, private video: VideoService, @InjectModel(Aula.name) private aulas: Model<Aula>) {}

  @Get(':id/video')
  async player(@Usuaria() s: Sessao | undefined, @Param('id', ObjectIdPipe) id: string) {
    const a = await this.aulas.findById(id).lean();
    if (!a) throw new NotFoundException('Aula não encontrada.');
    const liberada = a.aulaGratis || (s && (s.papel === 'admin' || (await this.enrollments.temAcesso(s.id, a.courseId))));
    if (!liberada) throw new ForbiddenException(s ? 'Seu acesso a este curso ainda não foi liberado.' : 'Entre na sua conta para assistir.');
    if (!a.videoProvider || !a.videoId) throw new NotFoundException('Esta aula ainda não tem vídeo.');
    return { aulaId: id, titulo: a.titulo, ...this.video.player(a.videoProvider, a.videoId) };
  }
}
