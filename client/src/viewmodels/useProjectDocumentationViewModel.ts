import { useCallback, useState } from 'react';
import type { ProjectDocumentation } from '@portafolio/shared';
import { AnalyticsRepository } from '../models/repositories/AnalyticsRepository.js';
import { ProjectRepository } from '../models/repositories/ProjectRepository.js';

/** Estado del modal flotante de documentación. */
export interface DocumentationViewModel {
  /** Proyecto abierto en el modal, o `null` si está cerrado. */
  openProjectId: string | null;
  title: string;
  documentation: ProjectDocumentation | null;
  isLoading: boolean;
  error: string | null;
  open: (projectId: string, title: string) => void;
  close: () => void;
}

/**
 * ViewModel del flujo de dos clics: el primero abre la documentación del
 * proyecto y el segundo, ya dentro del modal, lleva al proyecto real.
 */
export function useProjectDocumentationViewModel(): DocumentationViewModel {
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [documentation, setDocumentation] = useState<ProjectDocumentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((projectId: string, projectTitle: string) => {
    AnalyticsRepository.track('proyecto', projectId);
    setOpenProjectId(projectId);
    setTitle(projectTitle);
    setDocumentation(null);
    setError(null);
    setIsLoading(true);

    ProjectRepository.documentation(projectId)
      .then((doc) => {
        // Una carga que llega tarde no debe pisar el modal de otro proyecto.
        setOpenProjectId((current) => {
          if (current === projectId) setDocumentation(doc);
          return current;
        });
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const close = useCallback(() => {
    setOpenProjectId(null);
    setDocumentation(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { openProjectId, title, documentation, isLoading, error, open, close };
}
