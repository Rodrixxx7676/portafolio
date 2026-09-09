import type { ProjectCardModel } from '../../viewmodels/useProjectsViewModel.js';
import { useLocale } from '../../viewmodels/useLocale.js';

/**
 * Tarjeta de proyecto. Toda la tarjeta es el primer clic del flujo: abre la
 * ventana flotante con la documentación, no el proyecto en sí.
 */
export function ProjectCard({
  project,
  onOpen,
}: {
  project: ProjectCardModel;
  onOpen: (id: string, title: string) => void;
}): JSX.Element {
  const { t } = useLocale();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project.id, project.title)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(project.id, project.title);
        }
      }}
      aria-label={`${project.title} — ${t('projects.openDoc')}`}
      className="group flex cursor-pointer flex-col rounded-2xl border border-line bg-base-900 p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink transition group-hover:text-accent">
          {project.title}
        </h3>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-ink-muted">
          {t(project.statusLabelKey)}
        </span>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-ink-muted">{project.summary}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md bg-base-800 px-2 py-1 text-[11px] font-medium text-ink-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-xs text-ink-muted">
        {project.language ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {project.language}
          </span>
        ) : null}
        {/* Las métricas solo aparecen si GitHub respondió. */}
        {project.stars !== null ? <span>★ {project.stars}</span> : null}
        {project.forks !== null && project.forks > 0 ? <span>⑂ {project.forks}</span> : null}
        {project.updatedLabel ? (
          <span className="ml-auto">
            {t('projects.updated')} {project.updatedLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">
        {t('projects.openDoc')} →
      </p>
    </article>
  );
}
