import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GithubRepository } from './GithubRepository.js';

describe('GithubRepository.normalizeSlug', () => {
  it('acepta la forma owner/repo', () => {
    assert.equal(GithubRepository.normalizeSlug('Rodrixxx7676/Clack'), 'Rodrixxx7676/Clack');
  });

  it('entiende una URL completa de GitHub', () => {
    assert.equal(
      GithubRepository.normalizeSlug('https://github.com/Rodrixxx7676/Clack'),
      'Rodrixxx7676/Clack',
    );
  });

  it('descarta el sufijo .git', () => {
    assert.equal(GithubRepository.normalizeSlug('Rodrixxx7676/Clack.git'), 'Rodrixxx7676/Clack');
  });

  it('ignora lo que sobra tras el nombre del repositorio', () => {
    assert.equal(
      GithubRepository.normalizeSlug('Rodrixxx7676/Clack/tree/main/src'),
      'Rodrixxx7676/Clack',
    );
  });

  it('devuelve null cuando no hay nada que interpretar', () => {
    assert.equal(GithubRepository.normalizeSlug(''), null);
    assert.equal(GithubRepository.normalizeSlug('   '), null);
  });
});

describe('GithubRepository.sanitize', () => {
  it('elimina los scripts de la documentación', () => {
    const limpio = GithubRepository.sanitize('<p>Hola</p><script>alert(1)</script>');
    assert.equal(limpio.includes('<script'), false);
    assert.equal(limpio.includes('Hola'), true);
  });

  it('quita los manejadores de eventos incrustados', () => {
    const limpio = GithubRepository.sanitize('<img src="x.png" onerror="alert(1)" />');
    assert.equal(limpio.includes('onerror'), false);
  });

  it('abre los enlaces fuera y sin acceso a la página de origen', () => {
    const limpio = GithubRepository.sanitize('<a href="https://ejemplo.com">ir</a>');
    assert.equal(limpio.includes('target="_blank"'), true);
    assert.equal(limpio.includes('rel="noopener noreferrer"'), true);
  });

  it('rechaza los enlaces con javascript:', () => {
    const limpio = GithubRepository.sanitize('<a href="javascript:alert(1)">pulsa</a>');
    assert.equal(limpio.includes('javascript:'), false);
  });
});
