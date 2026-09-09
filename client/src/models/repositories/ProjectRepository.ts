import type { Project, ProjectDocumentation } from '@portafolio/shared';
import { getJson } from './HttpClient.js';

/** Única puerta de entrada del cliente a los datos de proyectos. */
export const ProjectRepository = {
  list(signal?: AbortSignal): Promise<Project[]> {
    return getJson<Project[]>('/api/projects', signal);
  },

  /** Documentación del modal flotante (README renderizado por el servidor). */
  documentation(projectId: string, signal?: AbortSignal): Promise<ProjectDocumentation> {
    return getJson<ProjectDocumentation>(
      `/api/projects/${encodeURIComponent(projectId)}/documentation`,
      signal,
    );
  },
};
