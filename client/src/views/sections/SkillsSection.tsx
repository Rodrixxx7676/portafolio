import type { SkillCategory } from '@portafolio/shared';
import { useLocale } from '../../viewmodels/useLocale.js';
import { BorderGlow } from '../components/BorderGlow.js';
import { SectionShell } from '../components/SectionShell.js';

/** Stack técnico agrupado por categoría, con nivel de 1 a 5. */
export function SkillsSection({ categories }: { categories: SkillCategory[] }): JSX.Element | null {
  const { t, tx } = useLocale();

  if (categories.length === 0) return null;

  return (
    <SectionShell id="skills" title={t('skills.title')}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <BorderGlow key={category.id} borderRadius={16} className="h-full">
            <div className="h-full p-6">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-accent-soft">
                {tx(category.name)}
              </h3>
              <ul className="space-y-4">
                {category.skills.map((skill) => (
                  <li key={skill.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-ink">{skill.name}</span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-base-800"
                      role="meter"
                      aria-valuenow={skill.level}
                      aria-valuemin={1}
                      aria-valuemax={5}
                      aria-label={skill.name}
                    >
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(Math.min(Math.max(skill.level, 1), 5) / 5) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </BorderGlow>
        ))}
      </div>
    </SectionShell>
  );
}
