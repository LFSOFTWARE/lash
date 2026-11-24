import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { slugify } from '../common/util';
import { Aula, Modulo } from '../content/content.schema';
import { Enrollment } from '../enrollments/enrollment.schema';
import { CriarProdutoDto, EditarProdutoDto, FiltroProdutosDto } from './product.dto';
import { Product, ProductDoc } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private products: Model<Product>,
    @InjectModel(Modulo.name) private modulos: Model<Modulo>,
    @InjectModel(Aula.name) private aulas: Model<Aula>,
    @InjectModel(Enrollment.name) private enrollments: Model<Enrollment>,
  ) {}

  listar(f: FiltroProdutosDto, todos = false) {
    const q: FilterQuery<Product> = {};
    if (!todos) q.publicado = true;
    if (f.tipo) q.tipo = f.tipo;
    if (f.formato) q.formato = f.formato;
    if (f.categoria) q.categoria = f.categoria;
    return this.products.find(q).sort({ ordem: 1, criadoEm: 1 });
  }

  async porSlug(slug: string, todos = false): Promise<ProductDoc> {
    const p = await this.products.findOne({ slug, ...(todos ? {} : { publicado: true }) });
    if (!p) throw new NotFoundException('Produto não encontrado.');
    return p;
  }

  async porId(id: string | Types.ObjectId): Promise<ProductDoc> {
    const p = await this.products.findById(id);
    if (!p) throw new NotFoundException('Produto não encontrado.');
    return p;
  }

  /** Grade do curso online sem os vídeos: módulos e aulas com título, duração e se é grátis. */
  async grade(courseId: Types.ObjectId | string) {
    const [mods, aulas] = await Promise.all([
      this.modulos.find({ courseId }).sort({ ordem: 1 }).lean(),
      this.aulas.find({ courseId }).sort({ ordem: 1 }).select('moduleId titulo descricao duracao aulaGratis ordem materiais.nome').lean(),
    ]);
    return mods.map((m) => ({
      id: String(m._id),
      titulo: m.titulo,
      ordem: m.ordem,
      aulas: aulas
        .filter((a) => String(a.moduleId) === String(m._id))
        .map((a) => ({ id: String(a._id), titulo: a.titulo, descricao: a.descricao, duracao: a.duracao, aulaGratis: a.aulaGratis, materiais: a.materiais.map((m) => m.nome) })),
    }));
  }

  private async conferir(dados: Partial<CriarProdutoDto>, atual?: ProductDoc) {
    const tipo = dados.tipo ?? atual?.tipo;
    if (tipo === 'curso' && !(dados.formato ?? atual?.formato)) throw new BadRequestException('Curso precisa do formato: presencial ou online.');
    if (dados.itens?.length) {
      if (tipo !== 'combo') throw new BadRequestException('Só combos têm itens.');
      const n = await this.products.countDocuments({ _id: { $in: dados.itens }, tipo: { $ne: 'combo' } });
      if (n !== new Set(dados.itens).size) throw new BadRequestException('Algum item do combo não existe ou é outro combo.');
    }
  }

  /** Campos enviados como null são apagados do documento. */
  private separarNulos(dados: Record<string, unknown>) {
    const set: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};
    for (const [k, v] of Object.entries(dados)) {
      if (v === null) unset[k] = 1;
      else if (v !== undefined) set[k] = v;
    }
    return { set, unset };
  }

  async criar(dto: CriarProdutoDto) {
    await this.conferir(dto);
    const { set } = this.separarNulos({ ...dto, slug: dto.slug || slugify(dto.titulo) });
    try {
      return await this.products.create(set);
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Já existe um produto com este slug.');
      throw e;
    }
  }

  async editar(id: string, dto: EditarProdutoDto) {
    const atual = await this.porId(id);
    await this.conferir(dto, atual);
    const { set, unset } = this.separarNulos({ ...dto });
    try {
      return await this.products.findByIdAndUpdate(id, { $set: set, $unset: unset }, { new: true, runValidators: true });
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Já existe um produto com este slug.');
      throw e;
    }
  }

  /** Só apaga produto sem pedidos; com pedidos, despublique. */
  async remover(id: string) {
    await this.porId(id);
    if (await this.enrollments.exists({ productId: id })) {
      throw new ConflictException('Este produto já tem pedidos. Despublique em vez de apagar.');
    }
    if (await this.products.exists({ itens: id })) throw new ConflictException('Este produto faz parte de um combo.');
    const mods = await this.modulos.find({ courseId: id }).select('_id').lean();
    await Promise.all([
      this.aulas.deleteMany({ courseId: id }),
      this.modulos.deleteMany({ _id: { $in: mods.map((m) => m._id) } }),
      this.products.deleteOne({ _id: id }),
    ]);
  }
}
