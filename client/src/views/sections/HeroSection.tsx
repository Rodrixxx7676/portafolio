import { AnalyticsRepository } from '../../models/repositories/AnalyticsRepository.js';
import { useLocale } from '../../viewmodels/useLocale.js';
import { useDeviceCapabilities } from '../../viewmodels/useDeviceCapabilities.js';
import { useScrollScrubbedVideo } from '../../viewmodels/useScrollScrubbedVideo.js';

/**
 * Apertura del sitio: el vídeo de fondo avanza y retrocede con el scroll
 * mientras la presentación se mantiene fija encima.
 *
 * La sección mide varias pantallas de alto a propósito: esa altura sobrante es
 * el recorrido que consume el vídeo. El contenido va dentro de una capa
 * `sticky`, de modo que se queda quieto en pantalla mientras la sección pasa.
 */
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
  const { containerRef, videoRef } = useScrollScrubbedVideo();
  const { canPlayHeroVideo } = useDeviceCapabilities();

  return (
    <section
      id="top"
      ref={containerRef}
      // Sin vídeo no hace falta recorrido extra: la portada ocupa una pantalla.
      className={canPlayHeroVideo ? 'relative h-[220vh]' : 'relative h-screen'}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {canPlayHeroVideo ? (
          <video
            ref={videoRef}
            // Un toque de saturación y contraste basta: el vídeo ya llega claro
            // y con los rojos vivos, así que forzarlo solo los quemaría.
            style={{ filter: 'saturate(1.2) contrast(1.05)' }}
            className="absolute inset-0 h-full w-full object-cover"
            src="/video/hero.mp4"
            poster="/video/hero-poster.jpg"
            // Sin controles ni reproducción automática: el único mando es el scroll.
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          // En móvil o con ahorro de datos, el fotograma fijo: cincuenta
          // kilobytes en lugar de tres megas, y la misma imagen de portada.
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/video/hero-poster.jpg)',
              filter: 'saturate(1.6) contrast(1.1)',
            }}
          />
        )}

        {/*
          Velo suave. La pared del vídeo ya es blanca justo donde va el texto,
          así que solo hace falta asegurar el contraste en los fotogramas con
          más detalle; cubrirlo más apagaría la escena sin ganar legibilidad.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-base-950/85 via-base-950/45 to-transparent"
        />
        {/* Cierre inferior: funde el vídeo con el papel del resto de la página. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-base-950"
        />

        <div className="relative mx-auto w-full max-w-6xl px-6">
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
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent-strong"
            >
              {t('hero.cta.projects')}
            </a>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                download
                onClick={() => AnalyticsRepository.track('cv')}
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-soft hover:text-accent-soft"
              >
                {t('hero.cta.resume')} ↓
              </a>
            ) : null}
          </div>
        </div>

        {/* Pista de que la página continúa hacia abajo. */}
        <a
          href="#projects"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 animate-bounce text-2xl text-ink-muted transition hover:text-accent-soft sm:block"
        >
          ↓
        </a>
      </div>
    </section>
  );
}
