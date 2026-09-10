/** Sucesos que el sitio informa a su propio servidor. */
export type EventoTipo = 'pageview' | 'cv' | 'proyecto' | 'demo' | 'repo';

/**
 * Envío de sucesos de uso.
 *
 * Va contra el propio servidor del portafolio: no hay terceros, ni cookies, ni
 * identificadores. Si el envío falla, se descarta en silencio; una estadística
 * nunca debe estropearle la visita a nadie.
 */
export const AnalyticsRepository = {
  track(type: EventoTipo, target = ''): void {
    // Se respeta la señal de "no me sigas" del navegador.
    if (navigator.doNotTrack === '1') return;

    const cuerpo = JSON.stringify({
      type,
      target,
      referrer: document.referrer,
      device: window.innerWidth < 768 ? 'movil' : 'escritorio',
    });

    try {
      // sendBeacon sobrevive a que el visitante se vaya de la página, que es
      // justo lo que pasa al pulsar "ver demo" o descargar el CV.
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/events', new Blob([cuerpo], { type: 'application/json' }));
        return;
      }
      void fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo,
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // Sin estadística se sigue viviendo.
    }
  },
};
