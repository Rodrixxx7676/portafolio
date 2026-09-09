import { useLocale } from '../../viewmodels/useLocale.js';

/** Presentación de apertura: lo primero que ve un reclutador. */
export function HeroSection({
  name,
  headline,
  location,
  resumeUrl,
}: {
  name: string;
  headline: string;
  location: string;
  resumeUrl: string;
}): JSX.Element {
  const { t } = useLocale();

  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col justify-center px-6 pt-24"
    >
      {/* Halo decorativo; no aporta contenido, se oculta a lectores de pantalla. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />

      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-soft">
        {location}
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
        {name || 'Francisco'}
        <span className="text-accent-soft">.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted sm:text-xl">{headline}</p>

      <div className="mt-9 flex flex-wrap gap-4">
        <a
          href="#projects"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-strong"
        >
          {t('hero.cta.projects')}
        </a>
        {resumeUrl ? (
          <a
            href={resumeUrl}
            download
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-soft hover:text-accent-soft"
          >
            {t('hero.cta.resume')} ↓
          </a>
        ) : null}
      </div>

      {/* Pista de que la página continúa hacia abajo. */}
      <a
        href="#projects"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute bottom-10 left-6 hidden animate-bounce text-2xl text-ink-muted transition hover:text-accent-soft sm:block"
      >
        ↓
      </a>
    </section>
  );
}
