import {
  BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, ParseFilePipeBuilder, Post, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import 'multer';
import { existsSync } from 'node:fs';
import { Papeis } from '../common/auth.decorators';
import { AuthGuard } from '../common/auth.guard';
import { ENV, Env } from '../config/env';
import { StorageService } from './storage.service';

const MAX = 100 * 1024 * 1024; // 100 MB
const IMAGEM = /^image\/(jpeg|png|webp|avif)$/;

@ApiTags('arquivos')
@Controller()
export class StorageController {
  constructor(private storage: StorageService, @Inject(ENV) private env: Env) {}

  /**
   * Envia um arquivo (campo "arquivo", multipart).
   * publico=true para capas (só imagens); senão fica privado (apostilas, materiais).
   */
  @Post('admin/uploads')
  @UseGuards(AuthGuard)
  @Papeis('admin')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: MAX } }))
  async enviar(
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true })) arquivo: Express.Multer.File,
    @Body('publico') publico?: string,
  ) {
    const pub = publico === 'true';
    if (pub && !IMAGEM.test(arquivo.mimetype)) throw new BadRequestException('Capa precisa ser imagem JPG, PNG, WebP ou AVIF.');
    return this.storage.salvar(arquivo, pub);
  }

  /** Download com link assinado (armazenamento local). */
  @Get('arquivos/download/:token')
  async baixar(@Param('token') token: string, @Res() res: Response) {
    const { chave, nome } = await this.storage.lerToken(token);
    const p = this.storage.caminhoLocal(chave);
    if (!existsSync(p)) throw new NotFoundException('Arquivo não encontrado.');
    res.setHeader('Cache-Control', 'private, no-store');
    return nome ? res.download(p, nome) : res.sendFile(p);
  }

  /** Arquivos públicos (capas) do armazenamento local. */
  @Get('arquivos/publico/:nome')
  publico(@Param('nome') nome: string, @Res() res: Response) {
    if (this.env.storage.driver !== 'local') throw new NotFoundException();
    const p = this.storage.caminhoLocal(`publico/${nome}`);
    if (!existsSync(p)) throw new NotFoundException();
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(p);
  }
}
