import { useLocale } from '../../viewmodels/useLocale.js';
import { SectionShell } from '../components/SectionShell.js';

/** Biografía breve. */
export function AboutSection({ about }: { about: string }): JSX.Element {
  const { t } = useLocale();

  return (
    <SectionShell id="about" title={t('about.title')}>
      <p className="max-w-3xl text-base leading-relaxed text-ink-muted">{about}</p>
    </SectionShell>
  );
}
