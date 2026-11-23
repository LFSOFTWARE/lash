import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ENV, Env } from '../config/env';

export interface Player {
  provedor: string;
  /** Endereço para usar no <iframe> do player. */
  embedUrl: string;
  /** Quando o link para de funcionar (só Bunny com chave). */
  expiraEm?: string;
}

/** Monta o endereço do player. No Bunny Stream com chave de token, o link é assinado e expira. */
@Injectable()
export class VideoService {
  constructor(@Inject(ENV) private env: Env) {}

  player(provedor: string, videoId: string, horas = 4): Player {
    switch (provedor) {
      case 'bunny': {
        const { libraryId, tokenKey } = this.env.bunny;
        const base = `https://iframe.mediadelivery.net/embed/${libraryId ?? '0'}/${videoId}`;
        if (!tokenKey) return { provedor, embedUrl: base };
        const expira = Math.floor(Date.now() / 1000) + horas * 3600;
        const token = createHash('sha256').update(tokenKey + videoId + expira).digest('hex');
        return { provedor, embedUrl: `${base}?token=${token}&expires=${expira}`, expiraEm: new Date(expira * 1000).toISOString() };
      }
      case 'vimeo':
        return { provedor, embedUrl: `https://player.vimeo.com/video/${videoId}` };
      case 'youtube':
        return { provedor, embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
      default:
        return { provedor, embedUrl: videoId };
    }
  }
}
