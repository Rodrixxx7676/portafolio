import { appendFile, mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** Suceso que registra el sitio. Nada de esto identifica a una persona. */
export interface AnalyticsEvent {
  /** "pageview", "cv", "proyecto", "demo" o "repo". */
  type: string;
  /** Ruta visitada o identificador del proyecto implicado. */
  target: string;
  /** Dominio de procedencia, sin ruta ni parámetros. */
  referrer: string;
  /** "movil" o "escritorio", deducido del ancho declarado por el cliente. */
  device: string;
  /** ISO 8601. */
  at: string;
}

const TIPOS_VALIDOS = new Set(['pageview', 'cv', 'proyecto', 'demo', 'repo']);

/**
 * Registro de visitas propio, sin cookies ni servicios de terceros.
 *
 * Guarda solo lo imprescindible para saber si el portafolio se está viendo:
 * qué se abre, desde qué dominio se llega y si es móvil o escritorio. No se
 * almacena la dirección IP, ni el agente de usuario, ni identificador alguno,
 * así que no hay nada que permita seguir a una persona entre visitas.
 *
 * Los sucesos se acumulan en memoria y se van escribiendo a un archivo de
 * texto. Ojo: en Elastic Beanstalk ese archivo vive en el disco de la
 * instancia y se pierde al redesplegar o al reiniciarla.
 */
export class AnalyticsRepository {
  readonly #buffer: AnalyticsEvent[] = [];
  readonly #dir: string;
  readonly #file: string;
  #ready: Promise<void> | null = null;

  constructor(dir = process.env.ANALYTICS_DIR ?? path.join(os.tmpdir(), 'portafolio-analytics')) {
    this.#dir = dir;
    this.#file = path.join(dir, 'eventos.jsonl');
  }

  async #ensureDir(): Promise<void> {
    this.#ready ??= mkdir(this.#dir, { recursive: true }).then(() => undefined);
    return this.#ready;
  }

  /** Normaliza y guarda un suceso. Devuelve `false` si venía mal formado. */
  async record(raw: Partial<AnalyticsEvent>): Promise<boolean> {
    const type = String(raw.type ?? '');
    if (!TIPOS_VALIDOS.has(type)) return false;

    const event: AnalyticsEvent = {
      type,
      target: String(raw.target ?? '').slice(0, 120),
      // Del origen solo interesa el dominio: la ruta completa podría llevar
      // datos de quien enlaza, y para saber de dónde llega la gente sobra.
      referrer: safeHost(String(raw.referrer ?? '')),
      device: raw.device === 'movil' ? 'movil' : 'escritorio',
      at: new Date().toISOString(),
    };

    this.#buffer.push(event);
    if (this.#buffer.length > 5000) this.#buffer.shift();

    try {
      await this.#ensureDir();
      await appendFile(this.#file, `${JSON.stringify(event)}\n`, 'utf8');
    } catch (error) {
      // Que no se pueda escribir no debe tumbar una petición del visitante.
      console.warn('[analytics] no se pudo guardar el suceso:', error);
    }
    return true;
  }

  /** Resumen de los últimos `days` días, listo para leerlo de un vistazo. */
  async summary(days = 30): Promise<Record<string, unknown>> {
    const desde = Date.now() - days * 24 * 60 * 60 * 1000;
    const eventos = await this.#readAll();
    const recientes = eventos.filter((e) => Date.parse(e.at) >= desde);

    const cuenta = (fn: (e: AnalyticsEvent) => string): Record<string, number> => {
      const salida: Record<string, number> = {};
      for (const e of recientes) {
        const clave = fn(e);
        if (clave) salida[clave] = (salida[clave] ?? 0) + 1;
      }
      return Object.fromEntries(Object.entries(salida).sort((a, b) => b[1] - a[1]).slice(0, 20));
    };

    return {
      dias: days,
      totales: recientes.length,
      visitas: recientes.filter((e) => e.type === 'pageview').length,
      descargasDeCv: recientes.filter((e) => e.type === 'cv').length,
      porTipo: cuenta((e) => e.type),
      proyectosAbiertos: cuenta((e) => (e.type === 'proyecto' ? e.target : '')),
      demosAbiertas: cuenta((e) => (e.type === 'demo' ? e.target : '')),
      procedencia: cuenta((e) => e.referrer || 'directo'),
      dispositivo: cuenta((e) => e.device),
      porDia: cuenta((e) => e.at.slice(0, 10)),
    };
  }

  async #readAll(): Promise<AnalyticsEvent[]> {
    try {
      const texto = await readFile(this.#file, 'utf8');
      return texto
        .split('\n')
        .filter(Boolean)
        .map((linea) => JSON.parse(linea) as AnalyticsEvent);
    } catch {
      // Sin archivo todavía: valen los sucesos que siguen en memoria.
      return [...this.#buffer];
    }
  }
}

/** Devuelve solo el dominio de una URL, o cadena vacía si no es una. */
function safeHost(value: string): string {
  if (!value) return '';
  try {
    return new URL(value).hostname.slice(0, 80);
  } catch {
    return '';
  }
}
