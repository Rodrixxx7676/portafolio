/**
 * Copia los JSON del catálogo junto al código compilado.
 *
 * El bundle que se sube a Beanstalk solo incluye `server/dist`, así que los
 * datos tienen que viajar dentro de esa carpeta.
 */
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.join(root, 'server', 'data');
const to = path.join(root, 'server', 'dist', 'data');

await mkdir(to, { recursive: true });
await cp(from, to, { recursive: true });
console.log(`[build] datos copiados a ${path.relative(root, to)}`);
