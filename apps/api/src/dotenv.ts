import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Carrega apps/api/.env se existir (variáveis já definidas no ambiente têm prioridade). */
export function carregarDotenv() {
  const f = resolve(__dirname, '..', '.env');
  if (existsSync(f)) process.loadEnvFile(f);
}
