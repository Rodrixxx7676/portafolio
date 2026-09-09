import { useLocale } from '../../viewmodels/useLocale.js';
import type { ProjectsViewModel } from '../../viewmodels/useProjectsViewModel.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { SectionShell } from '../components/SectionShell.js';
import { StateMessage } from '../components/StateMessage.js';

/** Listado filtrable de proyectos. */
export function ProjectsSection({
  viewModel,
  onOpenProject,
}: {
  viewModel: ProjectsViewModel;
  onOpenProject: (id: string, title: string) => void;
}): JSX.Element {
  const { t } = useLocale();
  const { projects, availableTags, activeTag, setActiveTag, isLoading, error, reload } = viewModel;

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={onOpenProject} />
            ))}
          </div>
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
