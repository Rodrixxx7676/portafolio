import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import type { AnalyticsRepository } from '../models/repositories/AnalyticsRepository.js';

/** Recogida de sucesos y consulta del resumen. */
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsRepository) {}

  /** El cliente envía aquí cada suceso. Responde 204 y sin cuerpo. */
  collect = async (req: Request, res: Response): Promise<void> => {
    // Quien pide no ser seguido, no se registra.
    if (req.headers.dnt === '1') {
      res.status(204).end();
      return;
    }

    await this.analytics.record((req.body ?? {}) as Record<string, string>);
    res.status(204).end();
  };

  /**
   * Resumen para Francisco. Va detrás de un testigo compartido porque, aunque
   * no haya datos personales, saber cuánta gente entra es asunto suyo.
   */
  summary = async (req: Request, res: Response): Promise<void> => {
    const token = req.query.token ?? req.headers['x-analytics-token'];

    if (!env.analyticsToken) {
      res.status(503).json({
        error: {
          code: 'ANALYTICS_SIN_CONFIGURAR',
          message: 'Define ANALYTICS_TOKEN en el entorno para poder consultar el resumen.',
        },
      });
      return;
    }
    if (token !== env.analyticsToken) {
      res.status(401).json({ error: { code: 'NO_AUTORIZADO', message: 'Testigo incorrecto.' } });
      return;
    }

    const days = Math.min(Math.max(Number(req.query.days ?? 30), 1), 365);
    res.json({ data: await this.analytics.summary(days) });
  };
}
