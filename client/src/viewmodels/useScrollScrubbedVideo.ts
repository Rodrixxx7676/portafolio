import { useEffect, useRef, type RefObject } from 'react';

/**
 * Avanza y retrocede un vídeo según el desplazamiento de la página.
 *
 * El vídeo nunca se reproduce solo: su fotograma se calcula a partir de cuánto
 * ha recorrido el visitante dentro del contenedor, así que bajar lo adelanta y
 * subir lo devuelve hacia atrás.
 *
 * El salto no se aplica de golpe: cada cuadro de animación acerca un poco el
 * tiempo actual al objetivo. Sin ese suavizado, una rueda de ratón —que llega
 * en saltos grandes y espaciados— haría que la imagen diera tirones.
 */
export interface ScrollScrubbedVideo {
  /** Sección alta que define cuánto recorrido de scroll consume el vídeo. */
  containerRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
}

export function useScrollScrubbedVideo(): ScrollScrubbedVideo {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // Quien pide menos animación ve el primer fotograma quieto.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let targetTime = 0;
    let currentTime = 0;
    let frame = 0;
    let running = true;
    let lastTickAt = 0;

    const computeTarget = (): void => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const rect = container.getBoundingClientRect();
      // Recorrido disponible: lo que sobra de la sección por encima de la ventana.
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      targetTime = progress * duration;
    };

    const tick = (): void => {
      if (!running) return;
      lastTickAt = performance.now();
      const distance = targetTime - currentTime;

      // Por debajo de un cuadro de vídeo no vale la pena pedir otro salto:
      // buscar posición es caro y la diferencia sería invisible.
      if (Math.abs(distance) > 1 / 24) {
        currentTime += distance * 0.18;
        if (video.readyState >= 2) video.currentTime = currentTime;
      }
      frame = requestAnimationFrame(tick);
    };

    const onScroll = (): void => {
      computeTarget();

      // Respaldo cuando el bucle de animación no está corriendo: los
      // navegadores lo congelan en pestañas de segundo plano y lo limitan en
      // equipos con poca batería. Sin esto, el vídeo se quedaría clavado en el
      // fotograma donde se detuvo y no volvería a seguir al scroll.
      if (performance.now() - lastTickAt > 200) {
        currentTime = targetTime;
        if (video.readyState >= 2) video.currentTime = currentTime;
      }
    };
    const onResize = (): void => computeTarget();
    const onLoaded = (): void => {
      computeTarget();
      currentTime = targetTime;
      video.currentTime = currentTime;
    };

    if (video.readyState >= 1) onLoaded();
    video.addEventListener('loadedmetadata', onLoaded);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      video.removeEventListener('loadedmetadata', onLoaded);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { containerRef, videoRef };
}
