import type { Profile } from '@portafolio/shared';
import { useCopyToClipboard } from '../../viewmodels/useCopyToClipboard.js';
import { AnalyticsRepository } from '../../models/repositories/AnalyticsRepository.js';
import { useLocale } from '../../viewmodels/useLocale.js';
import { SectionShell } from '../components/SectionShell.js';

/** Vías de contacto directas: correo, WhatsApp, LinkedIn, GitHub y CV. */
export function ContactSection({
  profile,
  resumeUrl,
}: {
  profile: Profile | null;
  resumeUrl: string;
}): JSX.Element {
  const { t } = useLocale();
  const { state, copy } = useCopyToClipboard();

  const enlaces = [
    profile?.whatsappUrl
      ? { key: 'contact.whatsapp' as const, href: profile.whatsappUrl, icon: 'fa-brands fa-whatsapp' }
      : null,
    profile?.linkedinUrl
      ? { key: 'contact.linkedin' as const, href: profile.linkedinUrl, icon: 'fa-brands fa-linkedin-in' }
      : null,
    profile?.githubUrl
      ? { key: 'contact.github' as const, href: profile.githubUrl, icon: 'fa-brands fa-github' }
      : null,
  ].filter((enlace) => enlace !== null);

  return (
    <SectionShell id="contact" title={t('contact.title')} subtitle={t('contact.subtitle')}>
      <div className="flex flex-wrap gap-4">
        {profile?.email ? (
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-strong"
          >
            <i className="fa-solid fa-envelope" aria-hidden="true" />
            {t('contact.email')}
          </a>
        ) : null}

        {enlaces.map((enlace) => (
          <a
            key={enlace.key}
            href={enlace.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-soft hover:text-accent-soft"
          >
            <i className={enlace.icon} aria-hidden="true" />
            {t(enlace.key)}
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
          </a>
        ))}

        {resumeUrl ? (
          <a
            href={resumeUrl}
            download
            onClick={() => AnalyticsRepository.track('cv')}
            className="flex items-center gap-2.5 rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-soft hover:text-accent-soft"
          >
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
            {t('contact.resume')}
          </a>
        ) : null}
      </div>

      {/* Datos en claro, con copia al portapapeles: quien navega sin cliente de
          correo configurado necesita poder llevarse la dirección igualmente. */}
      <div className="mt-10 space-y-3">
        {profile?.email ? (
          <div className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="text-sm text-accent-soft hover:underline">
              {profile.email}
            </a>
            <button
              type="button"
              onClick={() => copy(profile.email)}
              aria-live="polite"
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition ${
                state === 'copied'
                  ? 'border-accent-soft text-accent-soft'
                  : 'border-line text-ink-muted hover:border-accent-soft hover:text-accent-soft'
              }`}
            >
              <i
                className={state === 'copied' ? 'fa-solid fa-check' : 'fa-regular fa-copy'}
                aria-hidden="true"
              />
              {state === 'copied'
                ? t('contact.copied')
                : state === 'failed'
                  ? t('contact.copyFailed')
                  : t('contact.copy')}
            </button>
          </div>
        ) : null}

        {profile?.phone ? (
          <p className="flex items-center gap-2.5 text-sm text-ink-muted">
            <i className="fa-solid fa-phone text-xs text-accent-soft" aria-hidden="true" />
            <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="hover:text-accent-soft">
              {profile.phone}
            </a>
          </p>
        ) : null}
      </div>
    </SectionShell>
  );
}
