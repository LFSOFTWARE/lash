/** Lê e confere as variáveis de ambiente. Em produção, falha ao subir se faltar um segredo. */
export interface Env {
  port: number;
  mongoUri: string;
  webOrigins: string[];
  webUrl: string;
  apiUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  filesSecret: string;
  cookieSameSite: 'lax' | 'strict' | 'none';
  cookieSecure: boolean;
  whatsappInstrutora: string;
  storage: {
    driver: 'local' | 's3';
    dir: string;
    s3: { endpoint?: string; region: string; bucket?: string; accessKeyId?: string; secretAccessKey?: string; publicUrl?: string };
  };
  bunny: { libraryId?: string; tokenKey?: string };
}

const v = (k: string) => {
  const s = process.env[k];
  return s === undefined || s === '' ? undefined : s;
};

export function loadEnv(): Env {
  const prod = process.env.NODE_ENV === 'production';
  const segredo = (k: string, dev: string) => {
    const s = v(k);
    if (!s && prod) throw new Error(`Defina ${k} no ambiente.`);
    return s ?? dev;
  };
  const sameSite = (v('COOKIE_SAMESITE') ?? 'lax') as Env['cookieSameSite'];
  if (!['lax', 'strict', 'none'].includes(sameSite)) throw new Error('COOKIE_SAMESITE deve ser lax, strict ou none.');
  const driver = (v('STORAGE_DRIVER') ?? 'local') as Env['storage']['driver'];
  if (!['local', 's3'].includes(driver)) throw new Error('STORAGE_DRIVER deve ser local ou s3.');
  const port = Number(v('PORT') ?? 3333);

  return {
    port,
    mongoUri: v('MONGODB_URI') ?? 'mongodb://localhost:27017/lash',
    webOrigins: (v('WEB_ORIGIN') ?? 'http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean),
    webUrl: v('WEB_URL') ?? 'http://localhost:3000',
    apiUrl: v('API_URL') ?? `http://localhost:${port}`,
    jwtSecret: segredo('JWT_SECRET', 'dev-jwt'),
    jwtRefreshSecret: segredo('JWT_REFRESH_SECRET', 'dev-refresh'),
    filesSecret: segredo('FILES_SECRET', 'dev-files'),
    cookieSameSite: sameSite,
    cookieSecure: (v('COOKIE_SECURE') ?? (sameSite === 'none' ? 'true' : 'false')) === 'true',
    whatsappInstrutora: (v('WHATSAPP_INSTRUTORA') ?? '5511947692668').replace(/\D/g, ''),
    storage: {
      driver,
      dir: v('STORAGE_DIR') ?? './uploads',
      s3: {
        endpoint: v('S3_ENDPOINT'),
        region: v('S3_REGION') ?? 'auto',
        bucket: v('S3_BUCKET'),
        accessKeyId: v('S3_ACCESS_KEY_ID'),
        secretAccessKey: v('S3_SECRET_ACCESS_KEY'),
        publicUrl: v('S3_PUBLIC_URL'),
      },
    },
    bunny: { libraryId: v('BUNNY_LIBRARY_ID'), tokenKey: v('BUNNY_TOKEN_KEY') },
  };
}

export const ENV = Symbol('ENV');
