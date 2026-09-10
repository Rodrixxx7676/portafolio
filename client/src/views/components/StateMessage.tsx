import { useLocale } from '../../viewmodels/useLocale.js';

/** Mensaje de carga o de error con acción de reintento. */
export function StateMessage({
  variant,
  message,
  onRetry,
}: {
  variant: 'loading' | 'error';
  message?: string;
  onRetry?: () => void;
}): JSX.Element {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-base-900/60 px-6 py-10 text-center">
      {variant === 'loading' ? (
        <>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-sm text-ink-muted">{t('state.loading')}</p>
        </>
      ) : (
        <>
          <p className="text-sm text-ink">{t('state.error')}</p>
          {message ? <p className="text-xs text-ink-muted">{message}</p> : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 rounded-lg border border-accent-soft px-4 py-1.5 text-sm text-accent-soft transition hover:bg-accent hover:text-on-accent"
            >
              {t('state.retry')}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
