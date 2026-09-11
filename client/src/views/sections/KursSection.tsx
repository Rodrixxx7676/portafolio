import { useDeviceCapabilities } from '../../viewmodels/useDeviceCapabilities.js';
import { useLocale } from '../../viewmodels/useLocale.js';
import { useRevealVideo } from '../../viewmodels/useRevealVideo.js';

const KURS_URL = 'https://kurs-seenode.seenode.app';

/**
 * Cierre del sitio: la animación del logotipo de KURS con el lema encima.
 *
 * Esta sección no sigue la paleta blanca y roja del resto: KURS tiene su
 * propia identidad, en negro y gris metálico, y aquí se respeta. Los colores
 * van escritos a mano en lugar de usar los tokens del sitio a propósito.
 */
export function KursSection(): JSX.Element {
  const { t } = useLocale();
  const videoRef = useRevealVideo();
  const { canPlayHeroVideo } = useDeviceCapabilities();

  return (
    <section
      id="kurs"
      aria-label="KURS"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#0b0b0d]"
    >
      {canPlayHeroVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/kurs.mp4"
          poster="/video/kurs-poster.jpg"
          // Se reproduce una vez al entrar en pantalla y se queda en el logo.
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/video/kurs-poster.jpg)' }}
        />
      )}

      {/*
        Velo para que el lema se lea sobre el destello final del logotipo, que
        es lo más claro del vídeo. Se deja abierto en el centro para no tapar
        el propio logo mientras se dibuja.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,11,13,0.25)_0%,rgba(11,11,13,0.7)_70%,rgba(11,11,13,0.9)_100%)]"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#9a9a9f]">KURS</p>
        <h2 className="text-3xl font-bold leading-tight text-[#f4f4f5] sm:text-5xl">{t('kurs.lema')}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#b8b8be] sm:text-lg">
          {t('kurs.texto')}
        </p>
        <a
          href={KURS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2.5 rounded-full border border-[#3a3a40] bg-[#16161a]/80 px-6 py-3 text-sm font-semibold text-[#f4f4f5] backdrop-blur transition hover:border-[#9a9a9f] hover:bg-[#1f1f24]"
        >
          <i className="fa-solid fa-compass" aria-hidden="true" />
          {t('kurs.cta')}
          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
