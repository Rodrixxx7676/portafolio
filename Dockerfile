# Imagen del portafolio.
#
# El sitio se compila en tu máquina y aquí solo entra lo ya construido: la
# instancia comparte memoria con n8n y no conviene hacerle compilar nada.
FROM node:22-alpine

WORKDIR /app

# Primero las dependencias: mientras no cambien, Docker reutiliza esta capa.
COPY deploy/bundle/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund

COPY deploy/bundle/server ./server
COPY deploy/bundle/client ./client

# Caddy pone el TLS por delante, así que el proceso escucha en claro dentro
# de la red interna de Docker, sin publicar el puerto al exterior.
ENV NODE_ENV=production
ENV PORT=3002
ENV HTTPS_ENABLED=true

EXPOSE 3002

CMD ["node", "server/dist/index.js"]
