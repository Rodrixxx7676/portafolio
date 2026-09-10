import path from 'node:path';
import compression from 'compression';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { createApiRouter } from './routes/api.js';

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

app.use('/api', createApiRouter());

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint inexistente.' } });
});

// En producción este mismo proceso sirve el build de React; en desarrollo lo
// sirve Vite y solo se expone la API.
if (env.clientDist) {
  app.use(express.static(env.clientDist, { maxAge: '1h', index: false }));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(env.clientDist as string, 'index.html'));
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
