import { useEffect, useRef, type RefObject } from 'react';

/**
 * Reproduce un vídeo una sola vez cada vez que entra en pantalla.
 *
 * Pensado para animaciones de marca que revelan algo y terminan en una imagen
 * fija: ponerlas en bucle obligaría a ver el salto del final al principio, y
 * reproducirlas al cargar la página las gastaría antes de que nadie mire.
 * Cuando la sección sale de la vista, el vídeo se detiene y vuelve al inicio,
 * listo para la próxima visita.
 */
export function useRevealVideo(): RefObject<HTMLVideoElement> {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Quien pide menos animación ve el fotograma final desde el principio.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          video.currentTime = 0;
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      // Arranca cuando ya se ve al menos un tercio: así el visitante lo ve
      // desde el principio y no a medias.
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return videoRef;
}
