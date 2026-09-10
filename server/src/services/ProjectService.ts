import type { Project, ProjectDocumentation } from '@portafolio/shared';
import type { CatalogEntry } from '../models/domain/CatalogEntry.js';
import { CatalogRepository } from '../models/repositories/CatalogRepository.js';
import { GithubRepository } from '../models/repositories/GithubRepository.js';

/**
 * Combina el catálogo curado con los datos vivos de GitHub.
 *
 * Es el único lugar donde se decide qué gana: el texto y el orden los manda el
 * catálogo local; las estrellas, el lenguaje y el README los manda GitHub.
 */
export class ProjectService {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly github: GithubRepository,
  ) {}

  /** Proyectos listos para la vista, destacados primero. */
  async listProjects(): Promise<Project[]> {
    const entries = await this.catalog.listProjects();
    const projects = await Promise.all(entries.map((entry) => this.#toProject(entry)));
    return projects.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  /**
   * Documentación para la ventana flotante: el README del repo cuando existe,
   * el texto local como respaldo, y el destino del botón "ver el proyecto".
   */
  async getDocumentation(projectId: string): Promise<ProjectDocumentation | null> {
    const entry = await this.catalog.findProject(projectId);
    if (!entry) return null;

    const slug = entry.repo ? GithubRepository.normalizeSlug(entry.repo) : null;
    const readme = slug ? await this.github.getReadmeHtml(slug) : '';
    const stats = slug ? await this.github.getStats(slug) : null;

    const repoUrl = slug ? `https://github.com/${slug}` : undefined;
    const demoUrl = entry.demoUrl || stats?.homepage || undefined;

    if (readme) {
      return { projectId, html: readme, source: 'github', primaryUrl: demoUrl ?? repoUrl, repoUrl, demoUrl };
    }
    if (entry.fallbackDoc) {
      return {
        projectId,
        html: GithubRepository.sanitize(entry.fallbackDoc),
        source: 'local',
        primaryUrl: demoUrl ?? repoUrl,
        repoUrl,
        demoUrl,
      };
    }
    return { projectId, html: '', source: 'none', primaryUrl: demoUrl ?? repoUrl, repoUrl, demoUrl };
  }

  async #toProject(entry: CatalogEntry): Promise<Project> {
    const slug = entry.repo ? GithubRepository.normalizeSlug(entry.repo) : null;
    const github = slug ? await this.github.getStats(slug) : null;

    return {
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      tags: entry.tags,
      status: entry.status,
      repo: slug ?? undefined,
      repoUrl: slug ? `https://github.com/${slug}` : undefined,
      // La demo declarada a mano manda sobre la homepage que publica GitHub.
      demoUrl: entry.demoUrl || github?.homepage || undefined,
      // Sin portada propia, GitHub genera una con el nombre, la descripción y
      // las estadísticas del repositorio: mejor eso que un hueco gris.
      coverImage: entry.coverImage || (slug ? `https://opengraph.githubassets.com/1/${slug}` : undefined),
      github,
      featured: entry.featured ?? false,
    };
  }
}
