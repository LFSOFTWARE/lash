import type { CookieOptions, Response } from 'express';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../common/auth.guard';
import type { Env } from '../config/env';
import { ACCESS_TTL, REFRESH_TTL, Tokens } from './auth.service';

const base = (env: Env): CookieOptions => ({ httpOnly: true, sameSite: env.cookieSameSite, secure: env.cookieSecure });

export function gravarCookies(res: Response, env: Env, t: Tokens) {
  res.cookie(ACCESS_COOKIE, t.accessToken, { ...base(env), path: '/', maxAge: ACCESS_TTL * 1000 });
  res.cookie(REFRESH_COOKIE, t.refreshToken, { ...base(env), path: '/api/auth', maxAge: REFRESH_TTL * 1000 });
}

export function limparCookies(res: Response, env: Env) {
  res.clearCookie(ACCESS_COOKIE, { ...base(env), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...base(env), path: '/api/auth' });
}
