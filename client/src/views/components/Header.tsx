import { useEffect, useState } from 'react';
import { useLocale } from '../../viewmodels/useLocale.js';
import { LanguageToggle } from './LanguageToggle.js';

const SECTIONS = ['projects', 'about', 'experience', 'skills', 'contact'] as const;

/** Secciones que se ocultan cuando aún no tienen contenido cargado. */
type OptionalSection = 'experience' | 'skills';

/** Barra superior fija con navegación por anclas y selector de idioma. */
export function Header({
  name,
  hiddenSections = [],
}: {
  name: string;
  hiddenSections?: OptionalSection[];
}): JSX.Element {
  const { t } = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition ${
        isScrolled ? 'border-b border-line bg-base-950/90 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-sm font-bold tracking-tight text-ink">
          {name || 'Francisco'}
          <span className="text-accent">.</span>
        </a>

        <div className="flex items-center gap-6">
          {/* En móvil la navegación se resuelve haciendo scroll, no con menú. */}
          <ul className="hidden items-center gap-6 md:flex">
            {SECTIONS.filter(
              (section) => !hiddenSections.includes(section as OptionalSection),
            ).map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  className="text-sm text-ink-muted transition hover:text-accent"
                >
                  {t(`nav.${section}`)}
                </a>
              </li>
            ))}
          </ul>
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
