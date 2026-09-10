import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import './AccordionGallery.css';

/**
 * Galería en acordeón: paneles que se expanden al pasar el cursor.
 *
 * Componente de React Bits (https://reactbits.dev/components/accordion-gallery),
 * traducido a TypeScript y con una diferencia deliberada: el original envuelve
 * cada panel en un enlace que saca al visitante del sitio. Aquí el panel avisa
 * con `onSelect` y es el portafolio quien decide qué hacer, de modo que abrir un
 * proyecto sigue mostrando primero su documentación.
 */
export interface AccordionItem {
  image: string;
  label: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items: AccordionItem[];
  defaultIndex?: number;
  /** Se dispara al activar un panel que ya estaba abierto. */
  onSelect?: (index: number) => void;
  /** Avisa qué panel está abierto, para mostrar su detalle fuera de la galería. */
  onActiveChange?: (index: number) => void;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  /** Proporción del ancho que ocupa el panel abierto (0,2 a 0,9). */
  expandRatio?: number;
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

export function AccordionGallery({
  items,
  defaultIndex = 0,
  onSelect,
  onActiveChange,
  accentColor = '#b40808',
  overlayColor = '#1a1919',
  textColor = '#f9f5f5',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = '',
}: AccordionGalleryProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)));

  const prefersReduced =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
      // Cuánto debe crecer el panel abierto para ocupar esa proporción.
      const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
      const mediaSize = mediaSizeRef.current;

      timelineRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        tl.to(panel, { flexGrow: isActive ? grow : 1, rotateY: rot, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: isActive ? 0 : drift * parallax * mediaSize * 0.06,
              y: 0,
              '--ag-gray': grayscale ? (isActive ? 0 : 1) : 0,
              '--ag-dim': isActive ? 0 : 0.35,
              duration: dur,
              ease,
            },
            0,
          );
        }

        if (showLabels && bar && text) {
          const targets = [bar, text];
          if (isActive) {
            tl.to(targets, { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to(targets, { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      timelineRef.current = tl;
    },
    [active, count, expandRatio, duration, ease, tilt, parallax, grayscale, showLabels, stagger, prefersReduced],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = (): void => {
      const rect = el.getBoundingClientRect();
      const usable = Math.max(rect.width - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [applyLayout, gap, count, expandRatio]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(() => () => void timelineRef.current?.kill(), []);

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  // Si el filtro deja menos proyectos, el índice abierto puede quedar fuera.
  useEffect(() => {
    setActive((current) => (current > count - 1 ? 0 : current));
  }, [count]);

  /** Un panel cerrado se abre; el que ya estaba abierto entrega el control. */
  const handleClick = (index: number): void => {
    if (index === active) onSelect?.(index);
    else setActive(index);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index + 1) % count);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index - 1 + count) % count);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(index);
    }
  };

  const style = {
    '--ag-accent': accentColor,
    '--ag-overlay': overlayColor,
    '--ag-text': textColor,
    '--ag-gap': `${gap}px`,
    '--ag-radius': `${radius}px`,
    height: `${height}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${className ? ` ${className}` : ''}`}
      style={style}
      role="list"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <div
            key={item.label}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            style={{ borderRadius: `${radius}px` }}
            onClick={() => handleClick(i)}
            onMouseEnter={() => trigger === 'hover' && setActive(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(event) => handleKeyDown(i, event)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
              >
                {/* Sin carga diferida: son ilustraciones de un par de kilobytes y
                    diferirlas solo consigue que el panel abierto salga vacío. */}
                <img src={item.image} alt={item.alt ?? item.label} draggable="false" />
              </span>
              {showLabels ? (
                <span className="ag-panel__label" aria-hidden="true">
                  <span
                    className="ag-panel__bar"
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                  />
                  <span
                    className="ag-panel__text"
                    ref={(el) => {
                      textRefs.current[i] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AccordionGallery;
