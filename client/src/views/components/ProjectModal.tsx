import { useEffect, useRef } from 'react';
import type { DocumentationViewModel } from '../../viewmodels/useProjectDocumentationViewModel.js';
import { useLocale } from '../../viewmodels/useLocale.js';
import { StateMessage } from './StateMessage.js';

/**
 * Ventana con la explicación del proyecto: el segundo paso del recorrido.
 *
 * El panel se reparte en tres franjas fijas —encabezado, texto desplazable y
 * barra de acciones— para que los botones que llevan al proyecto estén siempre
 * a la vista, por larga que sea la documentación.
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
  const hasActions = Boolean(documentation?.demoUrl || documentation?.repoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/85 p-4 backdrop-blur-sm sm:p-6"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-base-900 shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              {t('modal.subtitle')}
              {documentation && documentation.source !== 'none' ? (
                <span className="text-line">
                  {' · '}
                  {documentation.source === 'github'
                    ? t('modal.sourceGithub')
                    : t('modal.sourceLocal')}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted transition hover:border-accent-soft hover:text-accent-soft"
            >
              ✕ {t('modal.close')}
            </button>
            {/* Cómo salir, dicho con todas sus letras. */}
            <span className="hidden text-[10px] text-ink-muted sm:block">
              {t('modal.closeHint')}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? <StateMessage variant="loading" /> : null}
          {error ? <StateMessage variant="error" message={error} /> : null}
          {!isLoading && !error && documentation ? (
            documentation.html ? (
              <div className="readme-body" dangerouslySetInnerHTML={{ __html: documentation.html }} />
            ) : (
              <p className="py-8 text-center text-sm text-ink-muted">{t('modal.noDoc')}</p>
            )
          ) : null}
        </div>

        {hasActions ? (
          <div className="shrink-0 border-t border-line bg-base-800/60 px-6 py-4">
            <p className="mb-3 text-xs font-medium text-ink-muted">{t('modal.footerHint')}</p>
            <div className="flex flex-wrap gap-3">
              {documentation?.demoUrl ? (
                <a
                  href={documentation.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-strong"
                >
                  ▶ {t('modal.viewDemo')}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              {documentation?.repoUrl ? (
                <a
                  href={documentation.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-soft hover:text-accent-soft"
                >
                  {'< >'} {t('modal.viewRepo')}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
