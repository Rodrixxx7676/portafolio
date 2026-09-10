import { useMemo } from 'react';
import { useLocale } from '../../viewmodels/useLocale.js';
import { BubbleMenu, type BubbleMenuItem } from './BubbleMenu.js';
import { LanguageToggle } from './LanguageToggle.js';

const SECTIONS = ['projects', 'about', 'experience', 'skills', 'contact'] as const;

/** Secciones que se ocultan cuando aún no tienen contenido cargado. */
type OptionalSection = 'experience' | 'skills';

/**
 * Inclinación y color de cada píldora del menú.
 *
 * Los tonos van del rojo de marca a sus versiones aclaradas, en lugar del
 * arcoíris que trae el componente de fábrica: en un sitio de dos colores, cinco
 * colores distintos en el menú desmontan la identidad. Sobre todos ellos el
 * texto va en blanco.
 */
const ESTILO_POR_SECCION: Record<(typeof SECTIONS)[number], { rotation: number; bg: string }> = {
  projects: { rotation: -8, bg: '#b40808' },
  about: { rotation: 8, bg: '#8f0606' },
  experience: { rotation: -6, bg: '#c81b1b' },
  skills: { rotation: 8, bg: '#8f0606' },
  contact: { rotation: -8, bg: '#b40808' },
};

/** Barra superior: identidad, cambio de idioma y menú de burbujas. */
export function Header({
  name,
  hiddenSections = [],
}: {
  name: string;
  hiddenSections?: OptionalSection[];
}): JSX.Element {
  const { t } = useLocale();

  const items = useMemo<BubbleMenuItem[]>(
    () =>
      SECTIONS.filter((section) => !hiddenSections.includes(section as OptionalSection)).map(
        (section) => {
          const estilo = ESTILO_POR_SECCION[section];
          return {
            label: t(`nav.${section}`),
            href: `#${section}`,
            ariaLabel: t(`nav.${section}`),
            rotation: estilo.rotation,
            hoverStyles: { bgColor: estilo.bg, textColor: '#ffffff' },
          };
        },
      ),
    // `t` cambia con el idioma, así que las etiquetas se rehacen solas.
    [t, hiddenSections],
  );

  return (
    <BubbleMenu
      logo={
        <a href="#top" className="text-sm font-bold tracking-tight text-ink">
          {name || 'Francisco'}
          <span className="text-accent">.</span>
        </a>
      }
      items={items}
      aside={<LanguageToggle />}
      menuAriaLabel={t('nav.menu')}
      menuBg="#ffffff"
      menuContentColor="#1a1919"
      useFixedPosition
    />
  );
}
