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

  const links = [
    profile?.email ? { key: 'contact.email', href: `mailto:${profile.email}`, external: false } : null,
    profile?.linkedinUrl ? { key: 'contact.linkedin', href: profile.linkedinUrl, external: true } : null,
    profile?.githubUrl ? { key: 'contact.github', href: profile.githubUrl, external: true } : null,
  ].filter((link): link is { key: 'contact.email' | 'contact.linkedin' | 'contact.github'; href: string; external: boolean } => link !== null);

  return (
    <SectionShell id="contact" title={t('contact.title')} subtitle={t('contact.subtitle')}>
      <div className="flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            {t(link.key)}
            {link.external ? ' ↗' : ''}
          </a>
        ))}
        {resumeUrl ? (
          <a
            href={resumeUrl}
            download
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-strong"
          >
            {t('contact.resume')} ↓
          </a>
        ) : null}
      </div>

      {profile?.email ? (
        <p className="mt-8 text-sm text-ink-muted">
          <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
            {profile.email}
          </a>
        </p>
      ) : null}
    </SectionShell>
  );
}
