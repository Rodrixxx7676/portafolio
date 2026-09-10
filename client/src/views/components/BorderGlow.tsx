import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './BorderGlow.css';

/**
 * Resplandor que sigue al cursor por el borde de una caja.
 *
 * Componente de React Bits (https://reactbits.dev/components/border-glow),
 * traducido a TypeScript y ajustado a la paleta del sitio. Toda la animación
 * ocurre en variables CSS: no hay estado de React ni renders por movimiento
 * del ratón, así que mover el cursor sobre una rejilla de tarjetas no cuesta
 * nada en tiempo de React.
 */

interface HSL {
  h: number;
  s: number;
  l: number;
}

/** Lee un color escrito como "0 70 65" (tono, saturación, luminosidad). */
function parseHSL(value: string): HSL {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 0, s: 70, l: 65 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

/** Genera los siete niveles de opacidad del halo. */
function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];

  const vars: Record<string, string> = {};
  opacities.forEach((opacity, index) => {
    vars[`--glow-color${keys[index]}`] = `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
  });
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = [
  '--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four',
  '--gradient-five', '--gradient-six', '--gradient-seven',
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < GRADIENT_KEYS.length; i++) {
    const color = colors[Math.min(COLOR_MAP[i] ?? 0, colors.length - 1)] ?? colors[0] ?? '#b40808';
    vars[GRADIENT_KEYS[i] as string] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0] ?? '#b40808'} 0 100%)`;
  return vars;
}

/** Un fondo claro necesita bordes y sombras distintos para no desaparecer. */
function isLightColor(color: string): boolean {
  const value = color.trim().replace('#', '');
  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
  const hex = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r * 0.2126 + g * 0.7152 + b * 0.0722 > 180;
}

const easeOutCubic = (x: number): number => 1 - (1 - x) ** 3;
const easeInCubic = (x: number): number => x * x * x;

interface AnimateOptions {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}

/** Interpola un valor con requestAnimationFrame; devuelve cómo cancelarlo. */
function animateValue({
  start = 0, end = 100, duration = 1000, delay = 0,
  ease = easeOutCubic, onUpdate, onEnd,
}: AnimateOptions): () => void {
  let frame = 0;
  let cancelled = false;

  const timer = setTimeout(() => {
    const t0 = performance.now();
    const tick = (): void => {
      if (cancelled) return;
      const progress = Math.min((performance.now() - t0) / duration, 1);
      onUpdate(start + (end - start) * ease(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else onEnd?.();
    };
    frame = requestAnimationFrame(tick);
  }, delay);

  // Sin esta limpieza, desmontar la caja a media animación deja el bucle vivo.
  return () => {
    cancelled = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
  };
}

export interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  /** Cuánto hay que acercarse al borde para encender el halo. */
  edgeSensitivity?: number;
  /** Color del halo en formato "tono saturación luminosidad". */
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  /** Ejecuta un barrido de presentación al montar. */
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

export function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  // Rojo aclarado: el rojo de marca es demasiado oscuro para brillar sobre negro.
  glowColor = '0 75 62',
  backgroundColor = '#262525',
  borderRadius = 16,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#b40808', '#dc6060', '#f9f5f5'],
  fillOpacity = 0.5,
}: BorderGlowProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    // Proximidad al borde: 0 en el centro, 1 justo sobre el borde.
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

    let angle = 0;
    if (dx !== 0 || dy !== 0) {
      angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
    }

    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card) return;

    const angleStart = 110;
    const angleEnd = 465;
    const setAngle = (value: number): void => {
      card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`);
    };

    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    const cancels = [
      animateValue({ duration: 500, onUpdate: (v) => card.style.setProperty('--edge-proximity', String(v)) }),
      animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: setAngle }),
      animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: setAngle }),
      animateValue({
        ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
        onUpdate: (v) => card.style.setProperty('--edge-proximity', String(v)),
        onEnd: () => card.classList.remove('sweep-active'),
      }),
    ];

    return () => cancels.forEach((cancel) => cancel());
  }, [animated]);

  const style = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  } as CSSProperties;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card${isLightColor(backgroundColor) ? ' border-glow-card--light' : ''} ${className}`}
      style={style}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}

export default BorderGlow;
