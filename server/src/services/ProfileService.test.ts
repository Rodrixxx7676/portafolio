import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TimelineEntry } from '@portafolio/shared';
import type { CatalogRepository } from '../models/repositories/CatalogRepository.js';
import { ProfileService } from './ProfileService.js';

const texto = { es: '', en: '' };

function entrada(id: string, startDate: string, endDate: string | null): TimelineEntry {
  return { id, kind: 'experiencia', role: texto, organization: '', startDate, endDate, description: texto, tags: [] };
}

function catalogoCon(entradas: TimelineEntry[]): CatalogRepository {
  return { getTimeline: async () => entradas } as unknown as CatalogRepository;
}

describe('ProfileService.getTimeline', () => {
  it('ordena de lo más reciente a lo más antiguo', async () => {
    const service = new ProfileService(
      catalogoCon([
        entrada('viejo', '2020-01', '2021-01'),
        entrada('nuevo', '2024-01', '2025-01'),
        entrada('medio', '2022-01', '2023-01'),
      ]),
    );

    const orden = (await service.getTimeline()).map((e) => e.id);
    assert.deepEqual(orden, ['nuevo', 'medio', 'viejo']);
  });

  it('lo que sigue en curso va siempre primero', async () => {
    const service = new ProfileService(
      catalogoCon([entrada('terminado', '2024-01', '2025-01'), entrada('en-curso', '2023-01', null)]),
    );

    const orden = (await service.getTimeline()).map((e) => e.id);
    assert.equal(orden[0], 'en-curso');
  });

  it('no altera el arreglo que recibe del catálogo', async () => {
    const entradas = [entrada('a', '2020-01', '2021-01'), entrada('b', '2024-01', '2025-01')];
    await new ProfileService(catalogoCon(entradas)).getTimeline();
    assert.equal(entradas[0]?.id, 'a', 'el orden original debe conservarse');
  });
});
