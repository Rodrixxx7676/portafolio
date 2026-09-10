#!/usr/bin/env bash
# ---------------------------------------------------------------------
# publicar.sh — Sube el portafolio al servidor, detrás de Caddy
# ---------------------------------------------------------------------
# Se ejecuta EN TU MAC, desde la carpeta del proyecto:
#
#   export PORTAFOLIO_SERVIDOR=usuario@tu-servidor
#   bash despliegue/publicar.sh
#
# Qué hace:
#   1. Compila el sitio aquí y arma el paquete
#   2. Envía solo lo necesario (unos pocos megas)
#   3. Reconstruye la imagen y reinicia el contenedor
#   4. Comprueba que responde
#
# n8n, Caddy y Clack no se tocan en ningún momento.
# ---------------------------------------------------------------------
set -euo pipefail

SERVIDOR="${PORTAFOLIO_SERVIDOR:?Falta PORTAFOLIO_SERVIDOR (usuario@servidor)}"
LLAVE="${LLAVE_SSH:-$HOME/Downloads/Ticket.pem}"
DOMINIO="${PORTAFOLIO_DOMINIO:-francisco.kursperu.duckdns.org}"
CONTENEDOR="portafolio"
PUERTO=3002
REMOTO="/home/ubuntu/portafolio"
PAQUETE="$(mktemp -t portafolio).tgz"

paso() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

paso "1/4 Compilando el sitio"
npm run bundle

paso "2/4 Enviando al servidor"
tar -czf "$PAQUETE" Dockerfile deploy/bundle
ssh -i "$LLAVE" "$SERVIDOR" "mkdir -p $REMOTO"
scp -i "$LLAVE" "$PAQUETE" "$SERVIDOR:$REMOTO/portafolio.tgz"
rm -f "$PAQUETE"

paso "3/4 Reconstruyendo el contenedor"
ssh -i "$LLAVE" "$SERVIDOR" bash -s <<REMOTE
set -euo pipefail
cd "$REMOTO"
rm -rf Dockerfile deploy
tar -xzf portafolio.tgz && rm portafolio.tgz

docker build -t $CONTENEDOR:latest .
docker rm -f $CONTENEDOR 2>/dev/null || true

# Misma red que Caddy y sin publicar puertos: solo el proxy puede alcanzarlo.
docker run -d --name $CONTENEDOR --restart unless-stopped \\
  --network n8n-docker_default \\
  -e ANALYTICS_TOKEN="\${ANALYTICS_TOKEN:-}" \\
  -e GITHUB_USER=Rodrixxx7676 \\
  -e GITHUB_TOKEN="\${GITHUB_TOKEN:-}" \\
  $CONTENEDOR:latest

docker image prune -f >/dev/null 2>&1 || true
REMOTE

paso "4/4 Comprobando"
sleep 3
CODIGO=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMINIO/health" || echo 000)
if [ "$CODIGO" = "200" ]; then
  printf '\033[32m✓ https://%s responde correctamente\033[0m\n' "$DOMINIO"
else
  printf '\033[31m✗ https://%s devolvió %s\033[0m\n' "$DOMINIO" "$CODIGO"
  echo "  Revisa: docker logs $CONTENEDOR"
  exit 1
fi
