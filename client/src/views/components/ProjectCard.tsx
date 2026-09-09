import type { ProjectCardModel } from '../../viewmodels/useProjectsViewModel.js';
import { useLocale } from '../../viewmodels/useLocale.js';

/**
 * Tarjeta de proyecto: el primer paso del recorrido.
 *
 * Toda la tarjeta es clicable y anuncia por adelantado qué va a encontrar quien
 * la abra, para que nadie tenga que adivinar ni pasar el mouse por encima.
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
      aria-label={`${project.title}: ${t('projects.openDoc')}`}
      className="group flex cursor-pointer flex-col rounded-2xl border border-line bg-base-900 p-6 transition hover:-translate-y-1 hover:border-accent-soft hover:shadow-lg hover:shadow-accent/10"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink transition group-hover:text-accent-soft">
          {project.title}
        </h3>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-ink-muted">
          {t(project.statusLabelKey)}
        </span>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-ink-muted">{project.summary}</p>

      {/* Qué se va a encontrar dentro, dicho antes de entrar. */}
      {project.hasDemo || project.hasRepo ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.hasDemo ? (
            <li className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent-soft">
              ▶ {t('projects.badge.demo')}
            </li>
          ) : null}
          {project.hasRepo ? (
            <li className="rounded-full bg-base-800 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
              {'< >'} {t('projects.badge.code')}
            </li>
          ) : null}
        </ul>
      ) : null}

      <ul className="mt-3 flex flex-wrap gap-2">
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
        {project.stars !== null ? <span>★ {project.stars}</span> : null}
        {project.forks !== null && project.forks > 0 ? <span>⑂ {project.forks}</span> : null}
        {project.updatedLabel ? (
          <span className="ml-auto">
            {t('projects.updated')} {project.updatedLabel}
          </span>
        ) : null}
      </div>

      {/*
        La llamada a la acción es permanente, no aparece solo al pasar el mouse:
        en una pantalla táctil ese estado no existe y la tarjeta se quedaría muda.
      */}
      <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-accent-soft">
        {t('projects.openDoc')}
        <span aria-hidden="true" className="transition group-hover:translate-x-1">
          →
        </span>
      </p>
    </article>
  );
}
