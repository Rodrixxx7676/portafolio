import fs from 'node:fs/promises';
import path from 'node:path';
import type { Profile, SkillCategory, TimelineEntry } from '@portafolio/shared';
import { env } from '../../config/env.js';
import type { CatalogEntry } from '../domain/CatalogEntry.js';

/**
 * Acceso de solo lectura a los JSON curados de `server/data`.
 *
 * Es la capa que aísla al resto de la aplicación del origen de los datos: si
 * mañana el catálogo se muda a DynamoDB, solo cambia esta clase.
 */
export class CatalogRepository {
  /** Los archivos se leen una vez por proceso; cambiarlos requiere redeploy. */
  readonly #cache = new Map<string, unknown>();

  async #readJson<T>(fileName: string): Promise<T> {
    const cached = this.#cache.get(fileName);
    if (cached !== undefined) return cached as T;

    const filePath = path.join(env.dataDir, fileName);
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as T;
    this.#cache.set(fileName, parsed);
    return parsed;
  }

  listProjects(): Promise<CatalogEntry[]> {
    return this.#readJson<CatalogEntry[]>('catalog.json');
  }

  async findProject(id: string): Promise<CatalogEntry | undefined> {
    const entries = await this.listProjects();
    return entries.find((entry) => entry.id === id);
  }

  getProfile(): Promise<Profile> {
    return this.#readJson<Profile>('profile.json');
  }

  getTimeline(): Promise<TimelineEntry[]> {
    return this.#readJson<TimelineEntry[]>('timeline.json');
  }

  getSkills(): Promise<SkillCategory[]> {
    return this.#readJson<SkillCategory[]>('skills.json');
  }
}
