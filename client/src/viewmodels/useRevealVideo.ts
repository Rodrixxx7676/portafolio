import { useEffect, useRef, type RefObject } from 'react';

/**
 * Reproduce un vídeo solo mientras está en pantalla.
 *
 * Reproducirlo al cargar la página lo gastaría antes de que nadie mire, y
 * dejarlo correr fuera de la vista consume batería para nada. Cuando la
 * sección entra, arranca; cuando sale, se detiene. Si el elemento lleva
 * `loop`, al volver sigue donde estaba.
 */
export function useRevealVideo(): RefObject<HTMLVideoElement> {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Quien pide menos animación ve el fotograma de portada, quieto.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      // Arranca cuando ya se ve al menos un tercio.
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return videoRef;
}
