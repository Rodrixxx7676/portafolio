import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

/** Devuelve el primer directorio existente de la lista, o `null`. */
function firstExisting(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const moduleDir = import.meta.dirname;

/**
 * Los JSON del catálogo se resuelven tanto en desarrollo (server/data, ejecutando
 * desde src/) como en producción (server/dist/data, que `scripts/copy-data.mjs`
 * genera durante el build).
 */
const resolvedDataDir =
  process.env.DATA_DIR ??
  firstExisting([
    path.join(moduleDir, '..', 'data'),
    path.join(moduleDir, '..', '..', 'data'),
  ]) ??
  path.join(moduleDir, '..', 'data');

/**
 * Build de React que sirve este mismo proceso. Solo existe en producción; en
 * desarrollo el frontend lo sirve Vite y este valor queda en `null`.
 */
const resolvedClientDist =
  process.env.CLIENT_DIST ??
  firstExisting([
    path.join(moduleDir, '..', '..', '..', 'client', 'dist'),
    path.join(moduleDir, '..', '..', 'client', 'dist'),
  ]);

export const env = {
  /** Beanstalk inyecta PORT=8080 en la instancia. */
  port: Number(process.env.PORT ?? 8080),
  isProduction: process.env.NODE_ENV === 'production',
  /**
   * El sitio se sirve por HTTPS de verdad (certificado en el balanceador o en
   * un proxy delante). Mientras sea `false`, el servidor no exige HTTPS ni
   * anuncia HSTS, porque haría inaccesible un entorno que solo escucha en HTTP.
   */
  https: process.env.HTTPS_ENABLED === 'true',
  dataDir: resolvedDataDir,
  clientDist: resolvedClientDist,
  github: {
    /** Usuario por defecto cuando una entrada del catálogo escribe solo el nombre del repo. */
    user: process.env.GITHUB_USER ?? '',
    /** Opcional. Sube el límite de 60 a 5000 peticiones por hora. */
    token: process.env.GITHUB_TOKEN ?? '',
    cacheTtlMs: Number(process.env.GITHUB_CACHE_TTL_MINUTES ?? 30) * 60 * 1000,
  },
} as const;
