import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Papeis } from '../common/auth.decorators';
import { AuthGuard } from '../common/auth.guard';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { CriarProdutoDto, EditarProdutoDto, FiltroProdutosDto } from './product.dto';
import { publicProduct } from './product.schema';
import { ProductsService } from './products.service';

/** Catálogo público: só produtos publicados. */
@ApiTags('catálogo')
@Controller('produtos')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  async listar(@Query() f: FiltroProdutosDto) {
    return (await this.svc.listar(f)).map((p) => publicProduct(p));
  }

  /** Página do produto. Curso online inclui a grade de aulas (sem vídeos); combo inclui os itens. */
  @Get(':slug')
  async detalhe(@Param('slug') slug: string) {
    const p = await this.svc.porSlug(slug);
    const base = publicProduct(p);
    if (p.tipo === 'curso' && p.formato === 'online') return { ...base, modulos: await this.svc.grade(p._id) };
    if (p.tipo === 'combo') {
      const itens = await Promise.all(p.itens.map((i) => this.svc.porId(i).then((x) => publicProduct(x)).catch(() => null)));
      return { ...base, itensDetalhe: itens.filter(Boolean) };
    }
    return base;
  }
}

@ApiTags('admin · produtos')
@Controller('admin/produtos')
@UseGuards(AuthGuard)
@Papeis('admin')
export class AdminProductsController {
  constructor(private svc: ProductsService) {}

  /** Todos, publicados ou não. */
  @Get()
  async listar(@Query() f: FiltroProdutosDto) {
    return (await this.svc.listar(f, true)).map((p) => publicProduct(p, true));
  }

  @Get(':id')
  async um(@Param('id', ObjectIdPipe) id: string) {
    const p = await this.svc.porId(id);
    return { ...publicProduct(p, true), modulos: p.tipo === 'curso' ? await this.svc.grade(p._id) : undefined };
  }

  @Post()
  async criar(@Body() dto: CriarProdutoDto) {
    return publicProduct(await this.svc.criar(dto), true);
  }

  @Patch(':id')
  async editar(@Param('id', ObjectIdPipe) id: string, @Body() dto: EditarProdutoDto) {
    return publicProduct((await this.svc.editar(id, dto))!, true);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ObjectIdPipe) id: string) {
    return this.svc.remover(id);
  }
}
