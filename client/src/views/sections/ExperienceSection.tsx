import { useLocale } from '../../viewmodels/useLocale.js';
import type { TimelineItemModel } from '../../viewmodels/useProfileViewModel.js';
import { SectionShell } from '../components/SectionShell.js';

/** Línea de tiempo laboral y académica en dos columnas. */
export function ExperienceSection({
  work,
  education,
}: {
  work: TimelineItemModel[];
  education: TimelineItemModel[];
}): JSX.Element {
  const { t } = useLocale();

  return (
    <SectionShell id="experience" title={t('experience.title')}>
      <div className="grid gap-12 lg:grid-cols-2">
        <TimelineColumn title={t('experience.work')} items={work} />
        <TimelineColumn title={t('experience.education')} items={education} />
      </div>
    </SectionShell>
  );
}

function TimelineColumn({
  title,
  items,
}: {
  title: string;
  items: TimelineItemModel[];
}): JSX.Element {
  return (
    <div>
      <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-accent">
        {title}
      </h3>
      <ol className="relative border-l border-line pl-6">
        {items.map((item) => (
          <li key={item.id} className="mb-8 last:mb-0">
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-xs text-ink-muted">{item.period}</p>
            <h4 className="mt-1 font-semibold text-ink">{item.role}</h4>
            <p className="text-sm text-accent">{item.organization}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            {item.tags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md bg-base-800 px-2 py-0.5 text-[11px] text-ink-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
