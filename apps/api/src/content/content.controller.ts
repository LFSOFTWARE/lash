import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Papeis } from '../common/auth.decorators';
import { AuthGuard } from '../common/auth.guard';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { Product } from '../products/product.schema';
import { Progresso } from '../progress/progress.schema';
import { CriarAulaDto, CriarModuloDto, EditarAulaDto, EditarModuloDto, OrdemDto } from './content.dto';
import { Aula, Modulo } from './content.schema';

/** Módulos e aulas dos cursos online (painel da instrutora). */
@ApiTags('admin · aulas')
@Controller('admin')
@UseGuards(AuthGuard)
@Papeis('admin')
export class AdminContentController {
  constructor(
    @InjectModel(Product.name) private products: Model<Product>,
    @InjectModel(Modulo.name) private modulos: Model<Modulo>,
    @InjectModel(Aula.name) private aulas: Model<Aula>,
    @InjectModel(Progresso.name) private progresso: Model<Progresso>,
  ) {}

  private async curso(id: string) {
    const p = await this.products.findById(id).lean();
    if (!p) throw new NotFoundException('Curso não encontrado.');
    if (p.tipo !== 'curso' || p.formato !== 'online') throw new BadRequestException('Módulos e aulas são só para cursos online.');
    return p;
  }

  private async modulo(id: string) {
    const m = await this.modulos.findById(id);
    if (!m) throw new NotFoundException('Módulo não encontrado.');
    return m;
  }

  /** Grade completa, com os dados de vídeo. */
  @Get('produtos/:id/modulos')
  async grade(@Param('id', ObjectIdPipe) id: string) {
    await this.curso(id);
    const [mods, aulas] = await Promise.all([
      this.modulos.find({ courseId: id }).sort({ ordem: 1 }).lean(),
      this.aulas.find({ courseId: id }).sort({ ordem: 1 }).lean(),
    ]);
    return mods.map((m) => ({
      id: String(m._id),
      titulo: m.titulo,
      ordem: m.ordem,
      aulas: aulas.filter((a) => String(a.moduleId) === String(m._id)).map(({ _id, __v, ...a }) => ({ id: String(_id), ...a })),
    }));
  }

  @Post('produtos/:id/modulos')
  async criarModulo(@Param('id', ObjectIdPipe) id: string, @Body() dto: CriarModuloDto) {
    await this.curso(id);
    const ordem = dto.ordem ?? (await this.modulos.countDocuments({ courseId: id }));
    const m = await this.modulos.create({ courseId: id, titulo: dto.titulo, ordem });
    return { id: String(m._id), titulo: m.titulo, ordem: m.ordem };
  }

  @Put('produtos/:id/modulos/ordem')
  @HttpCode(204)
  async ordenarModulos(@Param('id', ObjectIdPipe) id: string, @Body() dto: OrdemDto) {
    await this.curso(id);
    await this.modulos.bulkWrite(dto.ids.map((mid, ordem) => ({ updateOne: { filter: { _id: mid, courseId: id }, update: { ordem } } })));
  }

  @Patch('modulos/:id')
  async editarModulo(@Param('id', ObjectIdPipe) id: string, @Body() dto: EditarModuloDto) {
    const m = await this.modulo(id);
    m.set(dto);
    await m.save();
    return { id: String(m._id), titulo: m.titulo, ordem: m.ordem };
  }

  /** Apaga o módulo com as aulas e o progresso delas. */
  @Delete('modulos/:id')
  @HttpCode(204)
  async removerModulo(@Param('id', ObjectIdPipe) id: string) {
    await this.modulo(id);
    const aulas = await this.aulas.find({ moduleId: id }).select('_id').lean();
    await this.progresso.deleteMany({ lessonId: { $in: aulas.map((a) => a._id) } });
    await this.aulas.deleteMany({ moduleId: id });
    await this.modulos.deleteOne({ _id: id });
  }

  @Post('modulos/:id/aulas')
  async criarAula(@Param('id', ObjectIdPipe) id: string, @Body() dto: CriarAulaDto) {
    const m = await this.modulo(id);
    const ordem = dto.ordem ?? (await this.aulas.countDocuments({ moduleId: id }));
    const a = await this.aulas.create({ ...dto, ordem, moduleId: m._id, courseId: m.courseId });
    const { _id, __v, ...resto } = a.toObject();
    return { id: String(_id), ...resto };
  }

  @Put('modulos/:id/aulas/ordem')
  @HttpCode(204)
  async ordenarAulas(@Param('id', ObjectIdPipe) id: string, @Body() dto: OrdemDto) {
    await this.modulo(id);
    await this.aulas.bulkWrite(dto.ids.map((aid, ordem) => ({ updateOne: { filter: { _id: aid, moduleId: id }, update: { ordem } } })));
  }

  @Patch('aulas/:id')
  async editarAula(@Param('id', ObjectIdPipe) id: string, @Body() dto: EditarAulaDto) {
    const a = await this.aulas.findById(id);
    if (!a) throw new NotFoundException('Aula não encontrada.');
    if (dto.moduleId) {
      const m = await this.modulo(dto.moduleId);
      if (String(m.courseId) !== String(a.courseId)) throw new BadRequestException('O módulo é de outro curso.');
    }
    a.set(dto);
    await a.save();
    const { _id, __v, ...resto } = a.toObject();
    return { id: String(_id), ...resto };
  }

  @Delete('aulas/:id')
  @HttpCode(204)
  async removerAula(@Param('id', ObjectIdPipe) id: string) {
    const r = await this.aulas.deleteOne({ _id: id });
    if (!r.deletedCount) throw new NotFoundException('Aula não encontrada.');
    await this.progresso.deleteMany({ lessonId: id });
  }
}
