import { useCallback, useMemo, useState } from 'react';
import { useLocale } from '../../viewmodels/useLocale.js';
import type { ProjectsViewModel } from '../../viewmodels/useProjectsViewModel.js';
import { AccordionGallery, type AccordionItem } from '../components/AccordionGallery.js';
import { BorderGlow } from '../components/BorderGlow.js';
import { SectionShell } from '../components/SectionShell.js';
import { StateMessage } from '../components/StateMessage.js';

/**
 * Vitrina de proyectos: una galería en acordeón arriba y, debajo, el detalle
 * del que esté abierto.
 *
 * La galería sola diría poco más que un nombre sobre una imagen, así que el
 * panel de detalle sostiene lo que un reclutador necesita leer —resumen,
 * tecnologías, estado— sin obligarle a abrir nada todavía.
 */
export function ProjectsSection({
  viewModel,
  onOpenProject,
}: {
  viewModel: ProjectsViewModel;
  onOpenProject: (id: string, title: string) => void;
}): JSX.Element {
  const { t } = useLocale();
  const { projects, availableTags, activeTag, setActiveTag, isLoading, error, reload } = viewModel;
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo<AccordionItem[]>(
    () =>
      projects.map((project) => ({
        image: project.coverImage ?? '',
        label: project.title,
        alt: `${project.title}: ${project.summary}`,
      })),
    [projects],
  );

  const active = projects[Math.min(activeIndex, projects.length - 1)];

  const handleSelect = useCallback(
    (index: number) => {
      const project = projects[index];
      if (project) onOpenProject(project.id, project.title);
    },
    [projects, onOpenProject],
  );

  return (
    <SectionShell id="projects" title={t('projects.title')} subtitle={t('projects.subtitle')}>
      {availableTags.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterButton
            label={t('projects.filter.all')}
            isActive={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {availableTags.map((tag) => (
            <FilterButton
              key={tag}
              label={tag}
              isActive={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            />
          ))}
        </div>
      ) : null}

      {isLoading ? <StateMessage variant="loading" /> : null}
      {error ? <StateMessage variant="error" message={error} onRetry={reload} /> : null}

      {!isLoading && !error ? (
        projects.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('projects.empty')}</p>
        ) : (
          <>
            <AccordionGallery
              items={items}
              defaultIndex={0}
              onActiveChange={setActiveIndex}
              onSelect={handleSelect}
              height={420}
              expandRatio={projects.length > 1 ? 0.52 : 0.9}
              trigger="hover"
            />

            {active ? (
              <BorderGlow borderRadius={16} className="mt-8">
                <div className="p-6 sm:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-ink">{active.title}</h3>
                    <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-ink-muted">
                      {t(active.statusLabelKey)}
                    </span>
                    {active.hasDemo ? (
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent-soft">
                        <i className="fa-solid fa-play mr-1.5 text-[9px]" aria-hidden="true" />
                        {t('projects.badge.demo')}
                      </span>
                    ) : null}
                    {active.hasRepo ? (
                      <span className="rounded-full bg-base-800 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                        <i className="fa-solid fa-code mr-1.5 text-[10px]" aria-hidden="true" />
                        {t('projects.badge.code')}
                      </span>
                    ) : null}
                  </div>

                  <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">{active.summary}</p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {active.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-md bg-base-800 px-2 py-1 text-[11px] font-medium text-ink-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                    {active.language ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        {active.language}
                      </span>
                    ) : null}
                    {active.stars !== null ? (
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-star text-accent-soft" aria-hidden="true" />
                        {active.stars}
                      </span>
                    ) : null}
                    {active.updatedLabel ? (
                      <span>
                        {t('projects.updated')} {active.updatedLabel}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenProject(active.id, active.title)}
                    className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-strong"
                  >
                    {t('projects.openDoc')}
                    <i className="fa-solid fa-arrow-right ml-2" aria-hidden="true" />
                  </button>
                </div>
              </BorderGlow>
            ) : null}
          </>
        )
      ) : null}
    </SectionShell>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
        isActive
          ? 'border-accent bg-accent text-ink'
          : 'border-line text-ink-muted hover:border-accent-soft hover:text-accent-soft'
      }`}
    >
      {label}
    </button>
  );
}
