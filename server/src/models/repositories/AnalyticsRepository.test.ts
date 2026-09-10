import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { AnalyticsRepository } from './AnalyticsRepository.js';

/** Carpeta temporal propia para no pisar los datos reales. */
async function repositorioEnCarpetaNueva(): Promise<AnalyticsRepository> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'analytics-test-'));
  return new AnalyticsRepository(dir);
}

describe('AnalyticsRepository.record', () => {
  it('acepta los tipos de suceso conocidos', async () => {
    const repo = await repositorioEnCarpetaNueva();
    for (const type of ['pageview', 'cv', 'proyecto', 'demo', 'repo']) {
      assert.equal(await repo.record({ type }), true, `debería aceptar ${type}`);
    }
  });

  it('rechaza cualquier tipo inventado', async () => {
    const repo = await repositorioEnCarpetaNueva();
    assert.equal(await repo.record({ type: 'lo-que-sea' }), false);
    assert.equal(await repo.record({}), false);
  });

  it('del origen guarda solo el dominio, nunca la ruta completa', async () => {
    const repo = await repositorioEnCarpetaNueva();
    await repo.record({ type: 'pageview', referrer: 'https://www.linkedin.com/feed/algo?id=123' });

    const resumen = await repo.summary(30);
    const procedencia = resumen.procedencia as Record<string, number>;
    assert.ok(procedencia['www.linkedin.com'], 'debe quedarse con el dominio');
    assert.equal(
      Object.keys(procedencia).some((k) => k.includes('id=123')),
      false,
      'no debe conservar los parámetros de la dirección',
    );
  });

  it('un origen que no es una URL no rompe nada', async () => {
    const repo = await repositorioEnCarpetaNueva();
    assert.equal(await repo.record({ type: 'pageview', referrer: 'no-es-una-url' }), true);
  });

  it('solo distingue entre móvil y escritorio', async () => {
    const repo = await repositorioEnCarpetaNueva();
    await repo.record({ type: 'pageview', device: 'movil' });
    await repo.record({ type: 'pageview', device: 'lo-que-sea' });

    const dispositivo = (await repo.summary(30)).dispositivo as Record<string, number>;
    assert.equal(dispositivo['movil'], 1);
    assert.equal(dispositivo['escritorio'], 1, 'cualquier otro valor cuenta como escritorio');
  });

  it('recorta los identificadores desmesurados', async () => {
    const repo = await repositorioEnCarpetaNueva();
    await repo.record({ type: 'proyecto', target: 'x'.repeat(500) });

    const proyectos = (await repo.summary(30)).proyectosAbiertos as Record<string, number>;
    const clave = Object.keys(proyectos)[0] ?? '';
    assert.ok(clave.length <= 120, 'el identificador no debe superar los 120 caracteres');
  });
});

describe('AnalyticsRepository.summary', () => {
  it('cuenta visitas y descargas por separado', async () => {
    const repo = await repositorioEnCarpetaNueva();
    await repo.record({ type: 'pageview' });
    await repo.record({ type: 'pageview' });
    await repo.record({ type: 'cv' });

    const resumen = await repo.summary(30);
    assert.equal(resumen.visitas, 2);
    assert.equal(resumen.descargasDeCv, 1);
    assert.equal(resumen.totales, 3);
  });

  it('sin sucesos devuelve ceros y no falla', async () => {
    const repo = await repositorioEnCarpetaNueva();
    const resumen = await repo.summary(30);
    assert.equal(resumen.totales, 0);
    assert.equal(resumen.visitas, 0);
  });
});
