import { useLocale } from '../../viewmodels/useLocale.js';

/** Pie de página con la nota técnica del sitio. */
export function Footer({ name }: { name: string }): JSX.Element {
  const { t } = useLocale();

  return (
    <footer className="border-t border-line px-6 py-10 text-center">
      <p className="text-xs text-ink-muted">{t('footer.built')}</p>
      <p className="mt-2 text-xs text-ink-muted">
        © {new Date().getFullYear()} {name || 'Francisco'}
      </p>
    </footer>
  );
}
