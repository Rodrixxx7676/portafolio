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
      className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-muted transition hover:border-accent hover:text-accent"
    >
      <span className={locale === 'es' ? 'text-accent' : ''}>ES</span>
      <span className="mx-1 text-line">/</span>
      <span className={locale === 'en' ? 'text-accent' : ''}>EN</span>
    </button>
  );
}
