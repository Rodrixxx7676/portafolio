import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';
import './BubbleMenu.css';

/**
 * Menú de burbujas.
 *
 * Componente de React Bits (https://reactbits.dev/components/bubble-menu),
 * traducido a TypeScript con dos añadidos: los elementos pueden responder a un
 * callback además de a un enlace —el portafolio navega por anclas y conviene
 * cerrar el menú al elegir— y admite una burbuja extra para el selector de
 * idioma, que debe seguir a la vista sin abrir el menú.
 */
export interface BubbleMenuItem {
  label: string;
  href: string;
  ariaLabel?: string;
  /** Inclinación de la píldora en grados; solo se aplica en pantallas anchas. */
  rotation?: number;
  hoverStyles?: { bgColor?: string; textColor?: string };
}

export interface BubbleMenuProps {
  logo: ReactNode;
  items: BubbleMenuItem[];
  /** Burbuja adicional a la izquierda del botón (aquí, el cambio de idioma). */
  aside?: ReactNode;
  onSelect?: (item: BubbleMenuItem) => void;
  className?: string;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
}

export function BubbleMenu({
  logo,
  items,
  aside,
  onSelect,
  className,
  menuAriaLabel = 'Abrir menú',
  menuBg = '#ffffff',
  menuContentColor = '#1a1919',
  useFixedPosition = true,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12,
}: BubbleMenuProps): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const containerClassName = ['bubble-menu', useFixedPosition ? 'fixed' : 'absolute', className]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean) as HTMLElement[];
    const labels = labelRefs.current.filter(Boolean) as HTMLElement[];
    if (!overlay || !bubbles.length) return;

    // Quien pide menos animación ve el menú aparecer de golpe: el rebote del
    // «back.out» es justo el tipo de movimiento que puede marear.
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMenuOpen && sinMovimiento) {
      gsap.set(overlay, { display: 'flex' });
      gsap.set(bubbles, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 0, autoAlpha: 1 });
      return;
    }

    if (!isMenuOpen && sinMovimiento && showOverlay) {
      gsap.set(overlay, { display: 'none' });
      setShowOverlay(false);
      return;
    }

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const tl = gsap.timeline({ delay: i * staggerDelay + gsap.utils.random(-0.05, 0.05) });
        tl.to(bubble, { scale: 1, duration: animationDuration, ease: animationEase });
        const label = labels[i];
        if (label) {
          tl.to(
            label,
            { y: 0, autoAlpha: 1, duration: animationDuration, ease: 'power3.out' },
            `-=${animationDuration * 0.9}`,
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, { y: 24, autoAlpha: 0, duration: 0.2, ease: 'power3.in' });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          setShowOverlay(false);
        },
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  // La inclinación solo tiene sentido con sitio de sobra: en móvil las
  // píldoras se apilan y girarlas las haría chocar entre sí.
  useEffect(() => {
    const onResize = (): void => {
      if (!isMenuOpen) return;
      const anchoSuficiente = window.innerWidth >= 900;
      bubblesRef.current.forEach((bubble, i) => {
        const item = items[i];
        if (bubble && item) gsap.set(bubble, { rotation: anchoSuficiente ? (item.rotation ?? 0) : 0 });
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMenuOpen, items]);

  // Escape cierra el menú, como cualquier capa que tapa la página.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  const toggle = (): void => {
    setIsMenuOpen((abierto) => {
      if (!abierto) setShowOverlay(true);
      return !abierto;
    });
  };

  return (
    <>
      <nav className={containerClassName} aria-label="Navegación principal">
        <div className="bubble logo-bubble" aria-label="Inicio" style={{ background: menuBg }}>
          <span className="logo-content">{logo}</span>
        </div>

        <div className="bubble-actions">
          {aside ? (
            <div className="bubble aside-bubble" style={{ background: menuBg }}>
              {aside}
            </div>
          ) : null}

          <button
            type="button"
            className={`bubble toggle-bubble menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={toggle}
            aria-label={menuAriaLabel}
            aria-expanded={isMenuOpen}
            style={{ background: menuBg }}
          >
            <span className="menu-line" style={{ background: menuContentColor }} />
            <span className="menu-line short" style={{ background: menuContentColor }} />
          </button>
        </div>
      </nav>

      {showOverlay ? (
        <div
          ref={overlayRef}
          className={`bubble-menu-items ${useFixedPosition ? 'fixed' : 'absolute'}`}
          aria-hidden={!isMenuOpen}
        >
          <ul className="pill-list" role="menu" aria-label="Secciones">
            {items.map((item, idx) => (
              <li key={item.label} role="none" className="pill-col">
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel ?? item.label}
                  className="pill-link"
                  style={
                    {
                      '--item-rot': `${item.rotation ?? 0}deg`,
                      '--pill-bg': menuBg,
                      '--pill-color': menuContentColor,
                      '--hover-bg': item.hoverStyles?.bgColor ?? '#f5eaea',
                      '--hover-color': item.hoverStyles?.textColor ?? menuContentColor,
                    } as CSSProperties
                  }
                  ref={(el) => {
                    bubblesRef.current[idx] = el;
                  }}
                  onClick={() => {
                    // El destino es un ancla de esta misma página: el menú se
                    // cierra solo, o taparía justo aquello que se acaba de elegir.
                    setIsMenuOpen(false);
                    onSelect?.(item);
                  }}
                >
                  <span
                    className="pill-label"
                    ref={(el) => {
                      labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export default BubbleMenu;
