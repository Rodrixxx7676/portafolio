import { useCallback, useMemo, useState } from 'react';
import type { Project } from '@portafolio/shared';
import { ProjectRepository } from '../models/repositories/ProjectRepository.js';
import { useAsyncResource } from './useAsyncResource.js';

/** Proyecto ya formateado para pintar una tarjeta, sin lógica en la vista. */
export interface ProjectCardModel {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  statusLabelKey: `status.${Project['status']}`;
  stars: number | null;
  forks: number | null;
  language: string | null;
  /** Fecha lista para mostrar, ya localizada. Vacía si GitHub no la dio. */
  updatedLabel: string;
  hasDemo: boolean;
  featured: boolean;
}

export interface ProjectsViewModel {
  projects: ProjectCardModel[];
  /** Tecnologías presentes en el catálogo, para los botones de filtro. */
  availableTags: string[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * ViewModel del listado de proyectos: carga, filtra por tecnología y traduce
 * los datos crudos de la API a lo que la tarjeta necesita mostrar.
 */
export function useProjectsViewModel(locale: string): ProjectsViewModel {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { data, isLoading, error, reload } = useAsyncResource<Project[]>(
    (signal) => ProjectRepository.list(signal),
    [],
  );

  const formatDate = useCallback(
    (iso: string | null): string => {
      if (!iso) return '';
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' }).format(date);
    },
    [locale],
  );

  const allProjects = useMemo<ProjectCardModel[]>(() => {
    if (!data) return [];
    return data.map((project) => ({
      id: project.id,
      title: project.title,
      summary: project.summary[locale === 'en' ? 'en' : 'es'],
      tags: project.tags,
      statusLabelKey: `status.${project.status}` as const,
      stars: project.github?.stars ?? null,
      forks: project.github?.forks ?? null,
      language: project.github?.language ?? null,
      updatedLabel: formatDate(project.github?.pushedAt ?? null),
      hasDemo: Boolean(project.demoUrl),
      featured: project.featured,
    }));
  }, [data, locale, formatDate]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const project of allProjects) {
      for (const tag of project.tags) tags.add(tag);
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [allProjects]);

  const projects = useMemo(
    () => (activeTag ? allProjects.filter((project) => project.tags.includes(activeTag)) : allProjects),
    [allProjects, activeTag],
  );

  return { projects, availableTags, activeTag, setActiveTag, isLoading, error, reload };
}
