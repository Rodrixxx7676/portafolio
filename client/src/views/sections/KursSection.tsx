import { useDeviceCapabilities } from '../../viewmodels/useDeviceCapabilities.js';
import { useLocale } from '../../viewmodels/useLocale.js';
import { useRevealVideo } from '../../viewmodels/useRevealVideo.js';

const KURS_URL = 'https://kurs-seenode.seenode.app';

/**
 * Cierre del sitio: la animación del logotipo de KURS junto al lema.
 *
 * El logotipo ocupa el centro del vídeo, así que nada puede ir encima: el
 * texto va a un lado y el vídeo entero al otro, sin recortes ni velos. En
 * pantallas estrechas se apilan, vídeo arriba y texto debajo.
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
    <section id="kurs" aria-label="KURS" className="bg-[#0b0b0d] text-[#f4f4f5]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:py-28">
        {/* El vídeo va primero en el orden del documento para que en móvil
            quede arriba; en escritorio se coloca a la derecha. */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#0b0b0d] lg:order-2">
          {canPlayHeroVideo ? (
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              src="/video/kurs.mp4"
              poster="/video/kurs-poster.jpg"
              // En bucle mientras la sección esté a la vista. El archivo lleva
              // fundidos a negro en ambos extremos para que el empalme no se note.
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : (
            <img
              src="/video/kurs-poster.jpg"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
          )}
        </div>

        <div className="lg:order-1">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#9a9a9f]">KURS</p>
          <h2 className="text-3xl font-bold leading-tight text-[#f4f4f5] sm:text-5xl">{t('kurs.lema')}</h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#b8b8be] sm:text-lg">{t('kurs.texto')}</p>
          <a
            href={KURS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2.5 rounded-full border border-[#3a3a40] bg-[#16161a] px-6 py-3 text-sm font-semibold text-[#f4f4f5] transition hover:border-[#9a9a9f] hover:bg-[#1f1f24]"
          >
            <i className="fa-solid fa-compass" aria-hidden="true" />
            {t('kurs.cta')}
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
