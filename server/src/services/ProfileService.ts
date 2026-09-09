import type { Profile, SkillCategory, TimelineEntry } from '@portafolio/shared';
import type { CatalogRepository } from '../models/repositories/CatalogRepository.js';

/** Lecturas del bloque personal: perfil, línea de tiempo y habilidades. */
export class ProfileService {
  constructor(private readonly catalog: CatalogRepository) {}

  getProfile(): Promise<Profile> {
    return this.catalog.getProfile();
  }

  /** Experiencia y educación, de lo más reciente a lo más antiguo. */
  async getTimeline(): Promise<TimelineEntry[]> {
    const entries = await this.catalog.getTimeline();
    return [...entries].sort((a, b) => {
      // `endDate: null` significa "actualidad", así que va siempre arriba.
      const endA = a.endDate ?? '9999-99';
      const endB = b.endDate ?? '9999-99';
      return endB.localeCompare(endA) || b.startDate.localeCompare(a.startDate);
    });
  }

  getSkills(): Promise<SkillCategory[]> {
    return this.catalog.getSkills();
  }
}
