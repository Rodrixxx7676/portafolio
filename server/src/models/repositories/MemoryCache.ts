/**
 * Caché en memoria con expiración por entrada.
 *
 * La API pública de GitHub permite 60 peticiones por hora y por IP sin token.
 * Sin caché, unas pocas visitas simultáneas al portafolio agotarían la cuota y
 * los reclutadores verían tarjetas vacías, así que toda lectura de GitHub pasa
 * por aquí.
 */
export class MemoryCache<T> {
  readonly #entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.#entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.#entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.#entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /**
   * Devuelve el valor cacheado o ejecuta `producer` y guarda el resultado.
   * Los errores no se cachean: un fallo puntual de red no debe dejar el
   * proyecto sin datos durante todo el TTL.
   */
  async getOrSet(key: string, producer: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    this.set(key, value);
    return value;
  }

  clear(): void {
    this.#entries.clear();
  }
}
