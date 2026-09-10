import type { Profile } from '@portafolio/shared';
import { useLocale } from '../../viewmodels/useLocale.js';
import { SectionShell } from '../components/SectionShell.js';

/** Enlaces directos de contacto: correo, LinkedIn, GitHub y CV. */
export function ContactSection({
  profile,
  resumeUrl,
}: {
  profile: Profile | null;
  resumeUrl: string;
}): JSX.Element {
  const { t } = useLocale();

  // Los iconos vienen del kit de Font Awesome cargado en index.html.
  const links = [
    profile?.email
      ? { key: 'contact.email' as const, href: `mailto:${profile.email}`, external: false, icon: 'fa-solid fa-envelope' }
      : null,
    profile?.linkedinUrl
      ? { key: 'contact.linkedin' as const, href: profile.linkedinUrl, external: true, icon: 'fa-brands fa-linkedin-in' }
      : null,
    profile?.githubUrl
      ? { key: 'contact.github' as const, href: profile.githubUrl, external: true, icon: 'fa-brands fa-github' }
      : null,
  ].filter((link) => link !== null);

  return (
    <SectionShell id="contact" title={t('contact.title')} subtitle={t('contact.subtitle')}>
      <div className="flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="flex items-center gap-2.5 rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-soft hover:text-accent-soft"
          >
            <i className={link.icon} aria-hidden="true" />
            {t(link.key)}
            {link.external ? <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" /> : null}
          </a>
        ))}
        {resumeUrl ? (
          <a
            href={resumeUrl}
            download
            className="flex items-center gap-2.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-strong"
          >
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
            {t('contact.resume')}
          </a>
        ) : null}
      </div>

      {profile?.email ? (
        <p className="mt-8 text-sm text-ink-muted">
          <a href={`mailto:${profile.email}`} className="text-accent-soft hover:underline">
            {profile.email}
          </a>
        </p>
      ) : null}
    </SectionShell>
  );
}
