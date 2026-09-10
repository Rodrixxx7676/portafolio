import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';
import { ProfileController } from '../controllers/ProfileController.js';
import { ProjectsController } from '../controllers/ProjectsController.js';
import { AnalyticsRepository } from '../models/repositories/AnalyticsRepository.js';
import { CatalogRepository } from '../models/repositories/CatalogRepository.js';
import { GithubRepository } from '../models/repositories/GithubRepository.js';
import { ProfileService } from '../services/ProfileService.js';
import { ProjectService } from '../services/ProjectService.js';

/**
 * Express 4 no captura los rechazos de los handlers async, así que cada uno se
 * envuelve para que cualquier error llegue al middleware de errores.
 */
function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/** Composición de dependencias: se arma una sola vez al arrancar el proceso. */
export function createApiRouter(): Router {
  const catalog = new CatalogRepository();
  const github = new GithubRepository();

  const projects = new ProjectsController(new ProjectService(catalog, github));
  const profile = new ProfileController(new ProfileService(catalog));
  const analytics = new AnalyticsController(new AnalyticsRepository());

  const router = Router();
  router.get('/projects', asyncRoute(projects.list));
  router.get('/projects/:id/documentation', asyncRoute(projects.documentation));
  router.get('/profile', asyncRoute(profile.get));
  router.get('/timeline', asyncRoute(profile.timeline));
  router.get('/skills', asyncRoute(profile.skills));
  router.post('/events', asyncRoute(analytics.collect));
  router.get('/stats', asyncRoute(analytics.summary));
  return router;
}
