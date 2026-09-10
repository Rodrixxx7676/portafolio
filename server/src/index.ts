import { readFileSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { createApiRouter } from './routes/api.js';

/** Página para direcciones que no existen, con la estética del portafolio. */
function paginaNoEncontrada(origin: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Página no encontrada — Francisco Ponte</title>
    <style>
      body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
             background:#1a1919; color:#f9f5f5; font-family: ui-sans-serif, system-ui, sans-serif; }
      main { text-align:center; padding:2rem; }
      h1 { font-size:4rem; margin:0; color:#e19898; font-family: Georgia, serif; }
      p { color:#b5aeae; margin:.75rem 0 2rem; }
      a { display:inline-block; background:#b40808; color:#f9f5f5; text-decoration:none;
          padding:.7rem 1.4rem; border-radius:.5rem; font-weight:600; }
      a:hover { background:#8f0606; }
    </style>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>Esta dirección no existe.</p>
      <a href="${origin}/">Volver al inicio</a>
    </main>
  </body>
</html>
`;
}

const app = express();

app.disable('x-powered-by');
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Los README traen insignias y capturas alojadas en GitHub y terceros.
        imgSrc: ["'self'", 'data:', 'https:'],
        // El kit de Font Awesome se sirve desde su propio dominio y, una vez
        // cargado, pide sus hojas de estilo y tipografías a ka-f.fontawesome.com.
        scriptSrc: ["'self'", 'https://kit.fontawesome.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://ka-f.fontawesome.com', 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://ka-f.fontawesome.com', 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://ka-f.fontawesome.com'],
        frameAncestors: ["'self'"],
        // Solo se exige HTTPS cuando el entorno realmente lo sirve. Un entorno
        // de Elastic Beanstalk sin certificado escucha únicamente en HTTP: con
        // esta directiva activa, el navegador pediría cada archivo por HTTPS,
        // no obtendría respuesta y la página quedaría en blanco.
        ...(env.https ? {} : { upgradeInsecureRequests: null }),
      },
    },
    // Misma razón: anunciar HSTS desde un sitio HTTP deja al visitante sin
    // poder abrirlo durante un año, porque su navegador recordará que debe
    // usar HTTPS en este dominio.
    hsts: env.https,
    // Las imágenes remotas del README se bloquearían con la política estricta.
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

/** Chequeo de salud del balanceador de Elastic Beanstalk. */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Los sucesos son diminutos: un límite bajo evita que nadie use el
// endpoint para mandar cargas grandes.
app.use('/api/events', express.json({ limit: '4kb' }));
app.use('/api', createApiRouter());

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint inexistente.' } });
});

// En producción este mismo proceso sirve el build de React; en desarrollo lo
// sirve Vite y solo se expone la API.
if (env.clientDist) {
  /** Origen absoluto de la petición, respetando el proxy de Beanstalk. */
  const originOf = (req: Request): string => {
    const proto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0] ?? req.protocol;
    return `${proto}://${req.get('host') ?? ''}`;
  };

  // Ambos se generan al vuelo para que la dirección sea siempre la real: el
  // sitio responde hoy en elasticbeanstalk.com y mañana en un dominio propio,
  // y un sitemap con la dirección equivocada no lo sigue nadie.
  app.get('/robots.txt', (req: Request, res: Response) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${originOf(req)}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const hoy = new Date().toISOString().slice(0, 10);
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <url>\n    <loc>${originOf(req)}/</loc>\n    <lastmod>${hoy}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
        `</urlset>\n`,
    );
  });

  app.use(
    express.static(env.clientDist, {
      index: false,
      setHeaders: (res, filePath) => {
        // Los archivos generados llevan un hash en el nombre: cambian de nombre
        // al cambiar de contenido, así que se pueden guardar un año sin riesgo
        // de servir una versión vieja. El resto se revalida en cada visita.
        if (/[.-][A-Za-z0-9_-]{8,}\.(js|css)$/.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
      },
    }),
  );

  // El index se sirve desde memoria para poder completar la dirección de la
  // imagen social: LinkedIn y WhatsApp descartan las rutas relativas, así que
  // og:image tiene que salir con el dominio delante.
  const indexPath = path.join(env.clientDist, 'index.html');
  const indexHtml = readFileSync(indexPath, 'utf8');

  /** Rutas que existen de verdad en el cliente. El resto no es nada. */
  const RUTAS_DEL_CLIENTE = new Set(['/', '/index.html']);

  app.get('*', (req: Request, res: Response) => {
    // Devolver la portada ante cualquier dirección inventada haría que los
    // buscadores vieran un sitio con infinitas páginas iguales y dejaran de
    // indexarlo bien. Lo que no existe responde 404.
    const conocida = RUTAS_DEL_CLIENTE.has(req.path);
    const html = indexHtml.replaceAll('content="/og-image.jpg"', `content="${originOf(req)}/og-image.jpg"`);

    if (!conocida) {
      res.status(404).type('html').send(paginaNoEncontrada(originOf(req)));
      return;
    }
    res.type('html').send(html);
  });
} else {
  console.warn('[server] sin build de React: solo se sirve /api');
}

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server] error no controlado:', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor.' } });
});

app.listen(env.port, () => {
  console.log(`[server] escuchando en http://localhost:${env.port}`);
  console.log(`[server] datos: ${env.dataDir}`);
  console.log(`[server] frontend: ${env.clientDist ?? '(no compilado)'}`);
});
