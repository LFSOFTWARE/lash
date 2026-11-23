import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { escapeRegex, reais, waLink, waNumero } from '../common/util';
import { ENV, Env } from '../config/env';
import { Product, ProductDoc } from '../products/product.schema';
import { User } from '../users/user.schema';
import { Enrollment, EnrollmentDoc } from './enrollment.schema';
import { EditarPedidoDto, FiltroPedidosDto, LiberarDto } from './enrollment.dto';

const ativa = () => ({ status: 'ativa' as const, $or: [{ expiraEm: { $exists: false } }, { expiraEm: null }, { expiraEm: { $gt: new Date() } }] });

const NOME_TIPO: Record<string, string> = { curso: 'curso', apostila: 'apostila', planilha: 'planilha', combo: 'combo' };

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name) private enrollments: Model<Enrollment>,
    @InjectModel(Product.name) private products: Model<Product>,
    @InjectModel(User.name) private users: Model<User>,
    @Inject(ENV) private env: Env,
  ) {}

  /**
   * A aluna tem acesso ao produto se tiver matrícula ativa (e não vencida)
   * nele ou em um combo que o inclua.
   */
  async temAcesso(userId: string, productId: string | Types.ObjectId): Promise<boolean> {
    const combos = await this.products.find({ tipo: 'combo', itens: productId }).select('_id').lean();
    const ids = [new Types.ObjectId(String(productId)), ...combos.map((c) => c._id)];
    return Boolean(await this.enrollments.exists({ userId, productId: { $in: ids }, ...ativa() }));
  }

  /** Ids de todos os produtos liberados para a aluna (combos abertos nos itens). */
  async produtosLiberados(userId: string): Promise<Types.ObjectId[]> {
    const ativas = await this.enrollments.find({ userId, ...ativa() }).select('productId').lean();
    const ids = ativas.map((e) => e.productId);
    const combos = await this.products.find({ _id: { $in: ids }, tipo: 'combo' }).select('itens').lean();
    return [...ids, ...combos.flatMap((c) => c.itens)];
  }

  mensagemWhatsapp(u: { nome: string; email: string }, p: ProductDoc | Product) {
    const formato = p.formato ? ` ${p.formato}` : '';
    return waLink(
      this.env.whatsappInstrutora,
      `Olá, Camilla! Sou ${u.nome} e quero me inscrever no ${NOME_TIPO[p.tipo]}${formato} "${p.titulo}" (${reais(p.preco)}). Meu e-mail na plataforma é ${u.email}.`,
    );
  }

  /** Cria (ou reabre) o pedido pendente e devolve o link do WhatsApp com a mensagem pronta. */
  async pedir(userId: string, productId: string, observacao?: string) {
    const [u, p] = await Promise.all([this.users.findById(userId).lean(), this.products.findOne({ _id: productId, publicado: true })]);
    if (!u) throw new NotFoundException('Conta não encontrada.');
    if (!p) throw new NotFoundException('Produto não encontrado.');
    if (await this.temAcesso(userId, productId)) throw new ConflictException('Você já tem acesso a este produto.');

    let pedido = await this.enrollments.findOne({ userId, productId });
    if (!pedido) {
      try {
        pedido = await this.enrollments.create({ userId, productId, observacao });
      } catch (e: any) {
        // Dois cliques ao mesmo tempo: o outro já criou.
        if (e?.code !== 11000) throw e;
        pedido = (await this.enrollments.findOne({ userId, productId }))!;
      }
    } else if (pedido.status !== 'pendente') {
      // Cancelado ou vencido: volta a ser um pedido novo.
      pedido.set({ status: 'pendente', solicitadaEm: new Date(), canceladaEm: undefined, liberadaEm: undefined, liberadaPor: undefined, expiraEm: undefined });
      if (observacao !== undefined) pedido.observacao = observacao;
      await pedido.save();
    } else if (observacao !== undefined) {
      pedido.observacao = observacao;
      await pedido.save();
    }
    return { pedido: this.formatar(pedido, p), whatsappUrl: this.mensagemWhatsapp(u, p) };
  }

  formatar(e: EnrollmentDoc | (Enrollment & { _id: unknown }), p?: ProductDoc | (Product & { _id: unknown }) | null) {
    return {
      id: String(e._id),
      status: e.status,
      solicitadaEm: e.solicitadaEm,
      liberadaEm: e.liberadaEm,
      canceladaEm: e.canceladaEm,
      expiraEm: e.expiraEm,
      dataTurma: e.dataTurma,
      observacao: e.observacao,
      productId: String(e.productId),
      produto: p ? { id: String(p._id), titulo: p.titulo, slug: p.slug, tipo: p.tipo, formato: p.formato, capa: p.capa, preco: p.preco } : undefined,
    };
  }

  /** Pedidos da aluna, mais recentes primeiro. */
  async meus(userId: string) {
    const lista = await this.enrollments.find({ userId }).sort({ solicitadaEm: -1 }).populate<{ productId: ProductDoc }>('productId').lean();
    return lista
      .filter((e) => e.productId)
      .map((e) => {
        const p = e.productId as unknown as Product & { _id: Types.ObjectId };
        return { ...this.formatar({ ...e, productId: p._id } as never, p), vencida: Boolean(e.expiraEm && e.expiraEm < new Date()) };
      });
  }

  // ---------- Painel ----------

  async listar(f: FiltroPedidosDto) {
    const pagina = f.pagina ?? 1;
    const porPagina = f.porPagina ?? 20;
    const q: FilterQuery<Enrollment> = {};
    if (f.status) q.status = f.status;
    if (f.productId) q.productId = new Types.ObjectId(f.productId);
    if (f.userId) q.userId = new Types.ObjectId(f.userId);

    const depois: FilterQuery<unknown> = {};
    if (f.tipo) depois['produto.tipo'] = f.tipo;
    if (f.busca) {
      const r = new RegExp(escapeRegex(f.busca.trim()), 'i');
      const dig = f.busca.replace(/\D/g, '');
      depois.$or = [{ 'aluna.nome': r }, { 'aluna.email': r }, ...(dig.length >= 4 ? [{ 'aluna.whatsapp': new RegExp(dig) }] : [])];
    }

    const pipe: PipelineStage[] = [
      { $match: q },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'aluna', pipeline: [{ $project: { nome: 1, email: 1, whatsapp: 1 } }] } },
      { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'produto', pipeline: [{ $project: { titulo: 1, slug: 1, tipo: 1, formato: 1, preco: 1, capa: 1 } }] } },
      { $unwind: '$aluna' },
      { $unwind: '$produto' },
      { $match: depois },
      { $sort: { solicitadaEm: -1 } },
      { $facet: { itens: [{ $skip: (pagina - 1) * porPagina }, { $limit: porPagina }], total: [{ $count: 'n' }] } },
    ];
    const [r] = await this.enrollments.aggregate(pipe);
    const contagem = await this.enrollments.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
    return {
      itens: r.itens.map((e: any) => ({
        ...this.formatar(e, e.produto),
        aluna: { id: String(e.aluna._id), nome: e.aluna.nome, email: e.aluna.email, whatsapp: e.aluna.whatsapp, whatsappUrl: `https://wa.me/${waNumero(e.aluna.whatsapp)}` },
      })),
      total: r.total[0]?.n ?? 0,
      pagina,
      porPagina,
      porStatus: Object.fromEntries(contagem.map((c) => [c._id, c.n])),
    };
  }

  private async um(id: string) {
    const e = await this.enrollments.findById(id);
    if (!e) throw new NotFoundException('Pedido não encontrado.');
    return e;
  }

  async liberar(id: string, adminId: string, dto: LiberarDto) {
    const e = await this.um(id);
    e.set({
      status: 'ativa',
      liberadaEm: new Date(),
      liberadaPor: new Types.ObjectId(adminId),
      canceladaEm: undefined,
      ...(dto.dataTurma ? { dataTurma: new Date(dto.dataTurma) } : {}),
      ...(dto.expiraEm ? { expiraEm: new Date(dto.expiraEm) } : {}),
      ...(dto.observacao !== undefined ? { observacao: dto.observacao } : {}),
    });
    await e.save();
    return this.formatar(e, await this.products.findById(e.productId).lean());
  }

  async cancelar(id: string) {
    const e = await this.um(id);
    e.set({ status: 'cancelada', canceladaEm: new Date() });
    await e.save();
    return this.formatar(e, await this.products.findById(e.productId).lean());
  }

  async editar(id: string, dto: EditarPedidoDto) {
    const e = await this.um(id);
    if (dto.dataTurma !== undefined) e.set('dataTurma', dto.dataTurma ? new Date(dto.dataTurma) : undefined);
    if (dto.expiraEm !== undefined) e.set('expiraEm', dto.expiraEm ? new Date(dto.expiraEm) : undefined);
    if (dto.observacao !== undefined) e.set('observacao', dto.observacao);
    await e.save();
    return this.formatar(e, await this.products.findById(e.productId).lean());
  }

  /** Libera direto (sem pedido da aluna). Reaproveita o pedido se já existir. */
  async liberarDireto(userId: string, productId: string, adminId: string, extra: { dataTurma?: string; expiraEm?: string }) {
    const p = await this.products.findById(productId).lean();
    if (!p) throw new BadRequestException('Produto não encontrado.');
    const e = await this.enrollments.findOneAndUpdate(
      { userId, productId },
      {
        $set: {
          status: 'ativa',
          liberadaEm: new Date(),
          liberadaPor: new Types.ObjectId(adminId),
          ...(extra.dataTurma ? { dataTurma: new Date(extra.dataTurma) } : {}),
          ...(extra.expiraEm ? { expiraEm: new Date(extra.expiraEm) } : {}),
        },
        $unset: { canceladaEm: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return this.formatar(e, p);
  }
}
