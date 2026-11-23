import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { ENV, Env } from '../config/env';
import { slugify } from '../common/util';

export interface Upload {
  /** Chave a guardar no banco (produto.arquivo, aula.materiais[].arquivo, ou capa). */
  chave: string;
  /** Só para arquivos públicos (capas). */
  url?: string;
}

/**
 * Arquivos de apostilas, materiais e capas.
 * - local: pasta no servidor; downloads por link assinado da própria API.
 * - s3: S3 ou Cloudflare R2; downloads por URL pré-assinada do bucket.
 * Arquivos privados ficam em `privado/`, públicos em `publico/`.
 */
@Injectable()
export class StorageService {
  private s3?: S3Client;

  constructor(@Inject(ENV) private env: Env, private jwt: JwtService) {
    const c = env.storage.s3;
    if (env.storage.driver === 's3') {
      if (!c.bucket || !c.accessKeyId || !c.secretAccessKey) throw new Error('Defina S3_BUCKET, S3_ACCESS_KEY_ID e S3_SECRET_ACCESS_KEY.');
      this.s3 = new S3Client({
        region: c.region,
        endpoint: c.endpoint,
        forcePathStyle: Boolean(c.endpoint),
        credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
      });
    }
  }

  private raiz() {
    return resolve(this.env.storage.dir);
  }

  /** Caminho local seguro (impede sair da pasta com ../). */
  caminhoLocal(chave: string) {
    const raiz = this.raiz();
    const p = resolve(raiz, chave);
    if (!p.startsWith(raiz + sep)) throw new NotFoundException();
    return p;
  }

  async salvar(arquivo: { buffer: Buffer; originalname: string; mimetype: string }, publico: boolean): Promise<Upload> {
    // O multer entrega o nome do arquivo em latin1; volta para UTF-8 para não estragar acentos.
    const original = Buffer.from(arquivo.originalname, 'latin1').toString('utf8');
    const ext = extname(original).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const nome = slugify(original.slice(0, original.length - extname(original).length)).slice(0, 60) || 'arquivo';
    const chave = `${publico ? 'publico' : 'privado'}/${randomUUID()}-${nome}${ext}`;
    if (this.s3) {
      await this.s3.send(new PutObjectCommand({ Bucket: this.env.storage.s3.bucket, Key: chave, Body: arquivo.buffer, ContentType: arquivo.mimetype }));
    } else {
      const p = this.caminhoLocal(chave);
      await mkdir(dirname(p), { recursive: true });
      await writeFile(p, arquivo.buffer);
    }
    return { chave, url: publico ? this.urlPublica(chave) : undefined };
  }

  urlPublica(chave: string) {
    if (this.s3) {
      const base = this.env.storage.s3.publicUrl;
      return base ? `${base.replace(/\/$/, '')}/${chave}` : undefined;
    }
    return `${this.env.apiUrl.replace(/\/$/, '')}/api/arquivos/${chave}`;
  }

  /** Link de download temporário (5 min) para um arquivo privado. */
  async urlAssinada(chave: string, nomeDownload?: string, segundos = 300): Promise<string> {
    if (this.s3) {
      const disp = nomeDownload ? `attachment; filename*=UTF-8''${encodeURIComponent(nomeDownload)}` : undefined;
      return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.env.storage.s3.bucket, Key: chave, ResponseContentDisposition: disp }), {
        expiresIn: segundos,
      });
    }
    const token = await this.jwt.signAsync({ k: chave, n: nomeDownload }, { secret: this.env.filesSecret, expiresIn: segundos });
    return `${this.env.apiUrl.replace(/\/$/, '')}/api/arquivos/download/${token}`;
  }

  /** Confere o token de download local. */
  async lerToken(token: string): Promise<{ chave: string; nome?: string }> {
    try {
      const p = await this.jwt.verifyAsync<{ k: string; n?: string }>(token, { secret: this.env.filesSecret });
      return { chave: p.k, nome: p.n };
    } catch {
      throw new NotFoundException('Link vencido. Volte à área da aluna e baixe de novo.');
    }
  }

  async remover(chave: string) {
    if (this.s3) await this.s3.send(new DeleteObjectCommand({ Bucket: this.env.storage.s3.bucket, Key: chave }));
    else await rm(this.caminhoLocal(chave), { force: true });
  }
}
