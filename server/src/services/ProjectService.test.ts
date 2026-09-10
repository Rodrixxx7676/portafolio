import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GithubStats } from '@portafolio/shared';
import type { CatalogEntry } from '../models/domain/CatalogEntry.js';
import type { CatalogRepository } from '../models/repositories/CatalogRepository.js';
import type { GithubRepository } from '../models/repositories/GithubRepository.js';
import { ProjectService } from './ProjectService.js';

/** Catálogo de mentira: devuelve lo que le pasemos, sin tocar el disco. */
function catalogoCon(entradas: CatalogEntry[]): CatalogRepository {
  return {
    listProjects: async () => entradas,
    findProject: async (id: string) => entradas.find((e) => e.id === id),
  } as unknown as CatalogRepository;
}

/** GitHub de mentira: ni red ni esperas. */
function githubCon(stats: GithubStats | null, readme = ''): GithubRepository {
  return {
    getStats: async () => stats,
    getReadmeHtml: async () => readme,
  } as unknown as GithubRepository;
}

const ESTADISTICAS: GithubStats = {
  stars: 7, forks: 2, language: 'TypeScript', description: 'desde GitHub',
  topics: [], pushedAt: '2026-01-01T00:00:00Z', homepage: 'https://homepage-de-github.com',
};

const BASE: CatalogEntry = {
  id: 'demo',
  title: 'Demo',
  summary: { es: 'resumen', en: 'summary' },
  tags: ['Node.js'],
  status: 'activo',
  repo: 'usuario/demo',
};

describe('ProjectService.listProjects', () => {
  it('pone los destacados por delante', async () => {
    const service = new ProjectService(
      catalogoCon([
        { ...BASE, id: 'normal', featured: false },
        { ...BASE, id: 'destacado', featured: true },
      ]),
      githubCon(null),
    );

    const proyectos = await service.listProjects();
    assert.equal(proyectos[0]?.id, 'destacado');
  });

  it('la demo escrita a mano gana a la que publica GitHub', async () => {
    const service = new ProjectService(
      catalogoCon([{ ...BASE, demoUrl: 'https://mi-demo.com' }]),
      githubCon(ESTADISTICAS),
    );

    const [proyecto] = await service.listProjects();
    assert.equal(proyecto?.demoUrl, 'https://mi-demo.com');
  });

  it('sin demo propia se usa la homepage del repositorio', async () => {
    const service = new ProjectService(catalogoCon([{ ...BASE }]), githubCon(ESTADISTICAS));
    const [proyecto] = await service.listProjects();
    assert.equal(proyecto?.demoUrl, 'https://homepage-de-github.com');
  });

  it('si GitHub no responde, el proyecto se muestra igual sin métricas', async () => {
    const service = new ProjectService(catalogoCon([{ ...BASE }]), githubCon(null));
    const [proyecto] = await service.listProjects();

    assert.equal(proyecto?.github, null);
    assert.equal(proyecto?.title, 'Demo', 'el proyecto debe seguir apareciendo');
  });

  it('un proyecto sin repositorio no inventa enlace a GitHub', async () => {
    const service = new ProjectService(
      catalogoCon([{ ...BASE, repo: undefined }]),
      githubCon(ESTADISTICAS),
    );
    const [proyecto] = await service.listProjects();
    assert.equal(proyecto?.repoUrl, undefined);
  });
});

describe('ProjectService.getDocumentation', () => {
  it('prefiere el README del repositorio', async () => {
    const service = new ProjectService(
      catalogoCon([{ ...BASE, fallbackDoc: '<p>local</p>' }]),
      githubCon(ESTADISTICAS, '<h1>desde GitHub</h1>'),
    );

    const doc = await service.getDocumentation('demo');
    assert.equal(doc?.source, 'github');
  });

  it('usa la documentación local cuando no hay README', async () => {
    const service = new ProjectService(
      catalogoCon([{ ...BASE, fallbackDoc: '<p>escrita a mano</p>' }]),
      githubCon(ESTADISTICAS, ''),
    );

    const doc = await service.getDocumentation('demo');
    assert.equal(doc?.source, 'local');
    assert.equal(doc?.html.includes('escrita a mano'), true);
  });

  it('avisa cuando no hay documentación de ninguna clase', async () => {
    const service = new ProjectService(catalogoCon([{ ...BASE }]), githubCon(null, ''));
    const doc = await service.getDocumentation('demo');
    assert.equal(doc?.source, 'none');
  });

  it('devuelve null si el proyecto no existe', async () => {
    const service = new ProjectService(catalogoCon([]), githubCon(null));
    assert.equal(await service.getDocumentation('fantasma'), null);
  });
});
