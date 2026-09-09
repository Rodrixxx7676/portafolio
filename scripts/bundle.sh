#!/usr/bin/env bash
#
# Arma el paquete que se sube a Elastic Beanstalk.
#
# El build se hace aquí y no en la instancia EC2: la plataforma Node de
# Beanstalk instala solo dependencias de producción, así que compilar allá
# fallaría al no encontrar TypeScript ni Vite. El zip lleva el código ya
# compilado y un package.json reducido a las dependencias de runtime.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/deploy"
STAGE="$OUT/bundle"

cd "$ROOT"

echo "==> Compilando workspaces"
npm run build

echo "==> Preparando $STAGE"
rm -rf "$OUT"
mkdir -p "$STAGE/server" "$STAGE/client"

cp -R server/dist "$STAGE/server/dist"
cp -R client/dist "$STAGE/client/dist"
cp Procfile "$STAGE/Procfile"
[ -d .platform ] && cp -R .platform "$STAGE/.platform"
[ -d .ebextensions ] && cp -R .ebextensions "$STAGE/.ebextensions"

echo "==> Generando package.json de producción"
node - "$STAGE" <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const stage = process.argv[2];
const server = JSON.parse(readFileSync('server/package.json', 'utf8'));

// Las dependencias entre workspaces solo aportan tipos, que desaparecen al
// compilar: no tienen nada que hacer en el paquete de producción.
const dependencies = Object.fromEntries(
  Object.entries(server.dependencies ?? {}).filter(([name]) => !name.startsWith('@portafolio/')),
);

writeFileSync(
  path.join(stage, 'package.json'),
  `${JSON.stringify(
    {
      name: 'portafolio-francisco',
      version: JSON.parse(readFileSync('package.json', 'utf8')).version,
      private: true,
      type: 'module',
      engines: { node: '>=20' },
      scripts: { start: 'node server/dist/index.js' },
      dependencies,
    },
    null,
    2,
  )}\n`,
);
console.log('    dependencias de runtime:', Object.keys(dependencies).join(', '));
NODE

echo "==> Comprimiendo"
cd "$STAGE"
zip -qr "$OUT/portafolio.zip" . -x '*.DS_Store'
cd "$ROOT"

echo "==> Listo: deploy/portafolio.zip ($(du -h "$OUT/portafolio.zip" | cut -f1))"
echo "    Súbelo con: eb deploy   (o desde la consola de Elastic Beanstalk)"
