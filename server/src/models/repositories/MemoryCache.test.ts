import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MemoryCache } from './MemoryCache.js';

describe('MemoryCache', () => {
  it('devuelve lo que se guardó', () => {
    const cache = new MemoryCache<string>(1000);
    cache.set('clave', 'valor');
    assert.equal(cache.get('clave'), 'valor');
  });

  it('olvida las entradas vencidas', async () => {
    const cache = new MemoryCache<string>(10);
    cache.set('clave', 'valor');
    await new Promise((r) => setTimeout(r, 25));
    assert.equal(cache.get('clave'), undefined);
  });

  it('ejecuta el productor una sola vez mientras la entrada siga viva', async () => {
    const cache = new MemoryCache<number>(1000);
    let llamadas = 0;
    const producir = async (): Promise<number> => {
      llamadas += 1;
      return 42;
    };

    assert.equal(await cache.getOrSet('n', producir), 42);
    assert.equal(await cache.getOrSet('n', producir), 42);
    assert.equal(llamadas, 1, 'la segunda lectura debe venir de la caché');
  });

  it('no guarda los errores: un fallo puntual no deja el dato vacío durante todo el TTL', async () => {
    const cache = new MemoryCache<string>(10_000);
    await assert.rejects(() => cache.getOrSet('k', () => Promise.reject(new Error('red caída'))));

    const valor = await cache.getOrSet('k', () => Promise.resolve('ya funciona'));
    assert.equal(valor, 'ya funciona');
  });
});
