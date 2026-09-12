# Contexto para continuar este proyecto en otra sesión

Pega este documento al inicio de un chat nuevo. Resume qué es el proyecto, qué
decisiones ya están tomadas y qué queda pendiente, para no repetir trabajo.

## Quién soy

Francisco Ponte (nombre completo: Francisco Rodrigo Ponte Villarroel). Perú.
Estudiante de Ingeniería Empresarial y de Sistemas en la Universidad Científica
del Sur (desde 2023). Auxiliar de Sistemas en Grupo Carso desde marzo de 2026
(antes, Auxiliar Operativo, octubre 2025 – febrero 2026). Fundador de KURS,
estudio de desarrollo web y automatización para pymes.

- Correo: rodripontevillarroel@gmail.com · Tel.: +51 949 238 917
- GitHub: Rodrixxx7676 · LinkedIn: linkedin.com/in/rodrigo-ponte-baa1a7253
- **Empieza cada respuesta dirigiéndote a mí por mi nombre, Francisco.** Es mi
  canario para saber que las instrucciones siguen vigentes.

## El proyecto

Portafolio web para reclutadores. Carpeta: `Repositorio` (Google Drive).
Repo público: https://github.com/Rodrixxx7676/portafolio (rama `master`, CI en
verde con GitHub Actions).

**Stack:** monorepo npm con tres workspaces —`shared` (contrato de tipos),
`server` (Express + TypeScript) y `client` (React 18 + Vite + Tailwind 4 +
TypeScript)—. Arquitectura **MVVM estricta** en el cliente: `models/` habla
con la API, `viewmodels/` son hooks con estado y formateo, `views/` son
componentes puros. Regla: una vista nunca hace `fetch` ni formatea fechas; un
ViewModel nunca tiene JSX. En el servidor: models / services / controllers.

**Datos:** catálogo curado en `server/data/*.json` (proyectos, perfil,
trayectoria, skills). El README, estrellas y lenguaje de cada proyecto se
leen en vivo de la API de GitHub, con caché de 30 min y saneado de HTML.

**Flujo de dos clics:** la tarjeta de un proyecto abre un modal con su
documentación; desde el modal se sale a la demo o al código.

**33 pruebas** con el runner nativo de Node (`npm test`). `npm run verify`
ejecuta tipos + pruebas + build, igual que la CI.

## Cómo está el sitio hoy

- **Paleta blanca y roja.** Rojo `#b40808` (sirve como texto sobre blanco,
  7:1). Sobre superficie roja, texto blanco (`text-on-accent`). Nunca tinta
  oscura sobre rojo (2.5:1, ilegible).
- **Tipografía:** Fraunces (títulos) + Outfit (texto), de Google Fonts.
- **Header:** BubbleMenu de React Bits, con burbuja propia para ES/EN.
- **Hero:** vídeo de arquitectura blanca controlado por scroll (avanza al
  bajar, retrocede al subir). En móvil se sirve solo el póster.
- **Proyectos:** AccordionGallery de React Bits con 8 proyectos y portadas
  SVG propias, más un panel de detalle debajo con BorderGlow.
- **Trayectoria:** experiencia y educación, con 5 certificaciones enlazadas a
  su PDF en `client/public/certificados/`.
- **Contacto:** correo (con botón de copiar), WhatsApp, LinkedIn, GitHub, CV.
- **Cierre:** sección KURS (negro y gris, su propia identidad) con el vídeo del
  logotipo en bucle y el lema «Tecnología que marca tu rumbo».
- **ClickSpark** (chispas rojas al hacer clic) sobre toda la página.
- Sin pie de página y sin fondo animado (se quitaron a petición).
- Analítica propia sin cookies (`POST /api/events`, resumen en `/api/stats`
  con `ANALYTICS_TOKEN`). Se pierde al redesplegar en Beanstalk.
- SEO: `robots.txt` y `sitemap.xml` dinámicos, 404 real, tarjeta social
  (`og-image.jpg`), caché de un año para los assets con hash.

## Cómo se procesan los vídeos

Cualquier vídeo nuevo va a `support/`. Para el hero necesita **fotograma
clave en cada cuadro** (`ffmpeg -g 1`), sin audio, 720p. Para bucles, fundido
a negro en ambos extremos. Los archivos finales van a `client/public/video/`.

## Despliegue

- **Producción:** AWS Elastic Beanstalk, cuenta rodrixxx (656525891168),
  us-east-1, entorno `Repositorio-env`, instancia única t3.micro, Node.js 24.
  URL: http://repositorio.us-east-1.elasticbeanstalk.com (HTTP, sin
  certificado).
- **Cada despliegue:** `npm run bundle` genera `deploy/portafolio.zip`; se
  sube a mano desde la consola («Cargar e implementar»). El build se hace en
  local porque Beanstalk solo instala dependencias de producción.
- `HTTPS_ENABLED` debe quedar sin definir mientras el sitio vaya por HTTP: si
  se activa, el navegador pide todo por HTTPS y la página sale en blanco.
- **Alternativa con HTTPS gratis:** `despliegue/publicar.sh` + `Dockerfile`
  para servirlo detrás del Caddy de mi servidor propio (ver
  `despliegue/README.md`). Aún no activada.

## Mi servidor propio (fuera de este proyecto)

Instancia EC2 «Tickets WhatsApp», IP actual 52.91.49.113, **sin IP elástica**
(la IP cambia al reiniciar y tumba los dominios). DuckDNS `kursperu.duckdns.org`
apunta ahí; subdominios: `clack.kursperu.duckdns.org` (demo de Clack). Caddy
en contenedor `n8n-docker-caddy-1`, Caddyfile en
`/home/ubuntu/n8n-docker/Caddyfile`, recarga con
`docker exec n8n-docker-caddy-1 caddy reload --config /etc/caddy/Caddyfile`.

## Mis repos públicos

Clack (reloj mundial, demo viva), ward-demo (gestión de garantías con API de
Dell; versión sin datos de la empresa), kurs-seenode (web de KURS en
producción), kurs (versión .NET), sedix, vortexfit, gideon, portafolio.
El repo `ward` original sigue privado y contiene datos de Grupo Carso: **no
publicarlo**.

## Pendiente

1. Activar HTTPS con Caddy (dos comandos en el servidor) y dominio propio.
2. IP elástica para el servidor, o la demo de Clack se caerá en el próximo
   reinicio.
3. PDF del ITIL V4 (único certificado sin documento).
4. Capturas reales de los proyectos en lugar de las portadas SVG.
5. Regenerar el token de DuckDNS (quedó visible en una captura).
6. `kurs/KursApi/appsettings.json` (repo público) lleva una contraseña y una
   clave JWT de desarrollo escritas: moverlas a user-secrets.

## Cómo trabajar conmigo

- Verifica lo que haces; no me digas que algo funciona sin comprobarlo.
- Los screenshots del navegador integrado fallan tras hacer scroll y con
  WebGL o vídeo: verifica por DOM (`getBoundingClientRect`, estilos
  computados) y dilo cuando algo no se pudo ver.
- No inventes datos míos (fechas, cargos, cifras): pregunta.
- Al integrar componentes de React Bits: descargar el JSON del registro,
  revisar el código, traducir a TypeScript, adaptar a la paleta y respetar
  `prefers-reduced-motion`.
- Entrega el zip con `SendUserFile` cada vez que haya cambios.
