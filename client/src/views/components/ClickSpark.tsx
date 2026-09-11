import { useEffect, useRef } from 'react';

/**
 * Chispas que saltan del punto donde se hace clic.
 *
 * Componente de React Bits (https://reactbits.dev/animations/click-spark),
 * traducido a TypeScript y reescrito en tres puntos para poder cubrir la
 * página entera:
 *
 * - El lienzo va fijo al tamaño de la ventana, no al del contenido. El
 *   original lo dimensiona como su padre; con toda la página dentro serían
 *   miles de píxeles de alto.
 * - El bucle de dibujo solo corre mientras quede alguna chispa viva. El
 *   original pide un cuadro de animación por segundo de vida de la página,
 *   dibuje algo o no.
 * - Se dibuja a la densidad de píxeles real de la pantalla, para que las
 *   líneas no salgan borrosas en pantallas retina.
 */
export type SparkEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface ClickSparkProps {
  sparkColor?: string;
  /** Largo inicial de cada chispa, en píxeles. */
  sparkSize?: number;
  /** Distancia que recorre cada chispa desde el punto del clic. */
  sparkRadius?: number;
  sparkCount?: number;
  /** Duración de la animación, en milisegundos. */
  duration?: number;
  easing?: SparkEasing;
  extraScale?: number;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const EASINGS: Record<SparkEasing, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

export function ClickSpark({
  sparkColor = '#b40808',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
}: ClickSparkProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Quien pide menos animación no recibe chispas: el efecto es puro adorno.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ease = EASINGS[easing];

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timestamp: number): void => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const eased = ease(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const cos = Math.cos(spark.angle);
        const sin = Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
        ctx.lineTo(spark.x + (distance + lineLength) * cos, spark.y + (distance + lineLength) * sin);
        ctx.stroke();
        return true;
      });

      // Mientras haya chispas se sigue dibujando; cuando se apaga la última,
      // el bucle se detiene y no vuelve a costar nada hasta el próximo clic.
      frameRef.current = sparksRef.current.length ? requestAnimationFrame(draw) : 0;
    };

    const onPointerDown = (event: PointerEvent): void => {
      // Solo el botón principal: el clic derecho abre un menú, no un fuego artificial.
      if (event.button !== 0) return;

      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparksRef.current.push({
          x: event.clientX,
          y: event.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          startTime: now,
        });
      }
      if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      sparksRef.current = [];
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Encima de todo y sin recibir eventos: los clics atraviesan el lienzo y
      // llegan a lo que haya debajo, que es lo que el visitante quería pulsar.
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}

export default ClickSpark;
