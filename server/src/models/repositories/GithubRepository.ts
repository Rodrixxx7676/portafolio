import sanitizeHtml from 'sanitize-html';
import type { GithubStats } from '@portafolio/shared';
import { env } from '../../config/env.js';
import { MemoryCache } from './MemoryCache.js';

const GITHUB_API = 'https://api.github.com';

/** Respuesta parcial de GET /repos/{owner}/{repo}, solo los campos que usamos. */
interface GithubRepoResponse {
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  description?: string | null;
  topics?: string[];
  pushed_at?: string | null;
  homepage?: string | null;
}

/**
 * Reglas de saneado del README.
 *
 * El HTML llega ya renderizado por GitHub, pero es contenido externo: se
 * inyecta con `dangerouslySetInnerHTML` en el modal, así que aquí se recorta a
 * una lista blanca de etiquetas y atributos antes de salir del servidor.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'div', 'span', 'blockquote',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'strong', 'em', 'b', 'i', 'del', 's', 'sup', 'sub',
    'code', 'pre', 'kbd', 'samp',
    'a', 'img', 'picture', 'source',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'details', 'summary',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    source: ['srcset', 'media', 'type'],
    code: ['class'],
    pre: ['class'],
    span: ['class'],
    div: ['class'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

/**
 * Construye las reglas de saneado para un repositorio concreto.
 *
 * GitHub deja sin resolver las anclas (`#seccion`) y los enlaces a otros
 * archivos del repositorio (`DESPLIEGUE.md`). Servidos tal cual desde el
 * portafolio, el navegador los resolvería contra *nuestro* dominio y el
 * visitante acabaría de vuelta en la página de inicio, o en un 404. Aquí se
 * reescriben para que apunten a donde de verdad viven.
 */
function optionsForRepo(slug: string | null): sanitizeHtml.IOptions {
  return {
    ...SANITIZE_OPTIONS,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        let resolved = href;

        if (slug && href) {
          if (href.startsWith('#')) {
            // Las anclas del README funcionan en la portada del repositorio.
            resolved = `https://github.com/${slug}${href}`;
          } else if (!/^(https?:|mailto:)/i.test(href)) {
            const clean = href.replace(/^\.\//, '').replace(/^\//, '');
            resolved = `https://github.com/${slug}/blob/HEAD/${clean}`;
          }
        }

        return {
          tagName,
          attribs: { ...attribs, href: resolved, target: '_blank', rel: 'noopener noreferrer' },
        };
      },
    },
  };
}

/**
 * Cliente de la API pública de GitHub.
 *
 * Todas las lecturas pasan por caché y ningún fallo se propaga como excepción:
 * si GitHub no responde, el portafolio sigue mostrando los datos curados.
 */
export class GithubRepository {
  readonly #statsCache = new MemoryCache<GithubStats | null>(env.github.cacheTtlMs);
  readonly #readmeCache = new MemoryCache<string>(env.github.cacheTtlMs);

  /** Completa "repo" a "owner/repo" usando GITHUB_USER. */
  static normalizeSlug(repo: string): string | null {
    const trimmed = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/, '');
    if (!trimmed) return null;
    const parts = trimmed.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    if (parts.length === 1 && env.github.user) return `${env.github.user}/${parts[0]}`;
    return null;
  }

  async #request(pathname: string, accept: string): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: accept,
      'User-Agent': 'portafolio-francisco',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (env.github.token) headers.Authorization = `Bearer ${env.github.token}`;

    return fetch(`${GITHUB_API}${pathname}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
  }

  /** Métricas del repositorio. `null` si el repo no existe o GitHub falla. */
  async getStats(slug: string): Promise<GithubStats | null> {
    return this.#statsCache.getOrSet(slug, async () => {
      try {
        const response = await this.#request(`/repos/${slug}`, 'application/vnd.github+json');
        if (!response.ok) {
          console.warn(`[github] ${slug} respondió ${response.status}`);
          return null;
        }
        const repo = (await response.json()) as GithubRepoResponse;
        return {
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          language: repo.language ?? null,
          description: repo.description ?? null,
          topics: repo.topics ?? [],
          pushedAt: repo.pushed_at ?? null,
          homepage: repo.homepage || null,
        };
      } catch (error) {
        console.warn(`[github] no se pudo leer ${slug}:`, error);
        return null;
      }
    });
  }

  /**
   * README renderizado por GitHub y saneado. Cadena vacía si no hay README.
   * GitHub resuelve por su cuenta las rutas relativas a imágenes y enlaces.
   */
  async getReadmeHtml(slug: string): Promise<string> {
    return this.#readmeCache.getOrSet(slug, async () => {
      try {
        const response = await this.#request(`/repos/${slug}/readme`, 'application/vnd.github.html');
        if (!response.ok) {
          console.warn(`[github] README de ${slug} respondió ${response.status}`);
          return '';
        }
        return sanitizeHtml(await response.text(), optionsForRepo(slug));
      } catch (error) {
        console.warn(`[github] no se pudo leer el README de ${slug}:`, error);
        return '';
      }
    });
  }

  /** Sanea documentación local con las mismas reglas que el README remoto. */
  static sanitize(html: string): string {
    return sanitizeHtml(html, optionsForRepo(null));
  }
}
