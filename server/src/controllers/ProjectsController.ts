import type { Request, Response } from 'express';
import type { ProjectService } from '../services/ProjectService.js';

/**
 * Traduce peticiones HTTP a llamadas del servicio y de vuelta a JSON.
 * No contiene reglas de negocio: eso vive en `ProjectService`.
 */
export class ProjectsController {
  constructor(private readonly projects: ProjectService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.projects.listProjects();
    res.json({ data });
  };

  documentation = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? '');
    const doc = await this.projects.getDocumentation(id);
    if (!doc) {
      res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: `No existe el proyecto "${id}".` } });
      return;
    }
    res.json({ data: doc });
  };
}
