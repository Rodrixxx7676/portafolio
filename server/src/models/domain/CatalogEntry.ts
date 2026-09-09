import type { LocalizedText, ProjectStatus } from '@portafolio/shared';

/**
 * Una entrada del catálogo curado (`server/data/catalog.json`).
 *
 * Es la parte editorial del proyecto: qué se muestra, en qué orden y con qué
 * palabras. Lo que viene de GitHub (README, estrellas, lenguaje) se acopla
 * encima en `ProjectService`, nunca se escribe a mano aquí.
 */
export interface CatalogEntry {
  id: string;
  title: string;
  summary: LocalizedText;
  tags: string[];
  status: ProjectStatus;
  /** "owner/repo", o solo "repo" para usar GITHUB_USER como owner. Vacío = sin repo público. */
  repo?: string;
  /** Demo desplegada. Si está vacía se usa la homepage del repo, si GitHub la declara. */
  demoUrl?: string;
  coverImage?: string;
  featured?: boolean;
  /** Documentación local en HTML/Markdown, usada cuando el repo no tiene README. */
  fallbackDoc?: string;
}
