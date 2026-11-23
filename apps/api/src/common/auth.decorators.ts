import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export type Papel = 'aluna' | 'admin';
export interface Sessao {
  id: string;
  papel: Papel;
}

export const PAPEIS = 'papeis';
/** Rota só para esses papéis (exige login). */
export const Papeis = (...p: Papel[]) => SetMetadata(PAPEIS, p);

/** Usuária logada (ou undefined em rota com login opcional). */
export const Usuaria = createParamDecorator((_: unknown, ctx: ExecutionContext): Sessao | undefined => {
  return ctx.switchToHttp().getRequest().usuaria;
});
