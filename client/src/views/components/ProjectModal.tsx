import { useEffect, useRef } from 'react';
import type { DocumentationViewModel } from '../../viewmodels/useProjectDocumentationViewModel.js';
import { useLocale } from '../../viewmodels/useLocale.js';
import { StateMessage } from './StateMessage.js';

/**
 * Ventana flotante con la documentación del proyecto: el segundo paso del
 * flujo. Desde aquí, y solo desde aquí, se sale al proyecto real.
 */
export function ProjectModal({ viewModel }: { viewModel: DocumentationViewModel }): JSX.Element | null {
  const { t } = useLocale();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { openProjectId, close } = viewModel;

  useEffect(() => {
    if (!openProjectId) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);

    // El fondo no debe desplazarse mientras el modal está abierto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openProjectId, close]);

  if (!openProjectId) return null;

  const { documentation, isLoading, error, title } = viewModel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-base-950/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // El clic dentro del panel no debe cerrar el modal.
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-base-900 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-ink">{title}</h3>
            {documentation && documentation.source !== 'none' ? (
              <p className="text-xs text-ink-muted">
                {documentation.source === 'github' ? t('modal.sourceGithub') : t('modal.sourceLocal')}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label={t('modal.close')}
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted transition hover:border-accent hover:text-accent"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {isLoading ? <StateMessage variant="loading" /> : null}
          {error ? <StateMessage variant="error" message={error} /> : null}
          {!isLoading && !error && documentation ? (
            documentation.html ? (
              // El HTML viene renderizado por GitHub y saneado en el servidor.
              <div className="readme-body" dangerouslySetInnerHTML={{ __html: documentation.html }} />
            ) : (
              <p className="py-8 text-center text-sm text-ink-muted">{t('modal.noDoc')}</p>
            )
          ) : null}
        </div>

        {documentation && (documentation.demoUrl || documentation.repoUrl) ? (
          <div className="flex flex-wrap gap-3 border-t border-line bg-base-800/50 px-6 py-4">
            {documentation.demoUrl ? (
              <a
                href={documentation.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base-950 transition hover:bg-accent-strong"
              >
                {t('modal.viewDemo')} ↗
              </a>
            ) : null}
            {documentation.repoUrl ? (
              <a
                href={documentation.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                {t('modal.viewRepo')} ↗
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
