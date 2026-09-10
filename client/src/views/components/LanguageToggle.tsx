import { useLocale } from '../../viewmodels/useLocale.js';

/** Interruptor ES/EN del header. */
export function LanguageToggle(): JSX.Element {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t('lang.toggle')}
      title={t('lang.toggle')}
      className="text-xs font-semibold tracking-wide text-ink-muted transition hover:text-accent"
    >
      <span className={locale === 'es' ? 'text-accent-soft' : ''}>ES</span>
      <span className="mx-1 text-line">/</span>
      <span className={locale === 'en' ? 'text-accent-soft' : ''}>EN</span>
    </button>
  );
}
