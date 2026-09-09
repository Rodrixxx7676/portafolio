import { useMemo } from 'react';
import type { Locale, Profile, SkillCategory, TimelineEntry } from '@portafolio/shared';
import { ProfileRepository } from '../models/repositories/ProfileRepository.js';
import { useAsyncResource } from './useAsyncResource.js';

/** Entrada de la línea de tiempo con las fechas ya formateadas. */
export interface TimelineItemModel {
  id: string;
  kind: TimelineEntry['kind'];
  role: string;
  organization: string;
  period: string;
  description: string;
  tags: string[];
}

export interface ProfileViewModel {
  profile: Profile | null;
  headline: string;
  about: string;
  location: string;
  resumeUrl: string;
  work: TimelineItemModel[];
  education: TimelineItemModel[];
  skills: SkillCategory[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/** "2023-01" a "ene 2023" en el idioma activo. */
function formatMonth(value: string, locale: Locale): string {
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month ?? '1') - 1, 1);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}

/** ViewModel del bloque personal: perfil, trayectoria y habilidades. */
export function useProfileViewModel(locale: Locale, presentLabel: string): ProfileViewModel {
  const profileResource = useAsyncResource((signal) => ProfileRepository.profile(signal), []);
  const timelineResource = useAsyncResource((signal) => ProfileRepository.timeline(signal), []);
  const skillsResource = useAsyncResource((signal) => ProfileRepository.skills(signal), []);

  const items = useMemo<TimelineItemModel[]>(() => {
    const entries: TimelineEntry[] = timelineResource.data ?? [];
    return entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      role: entry.role[locale],
      organization: entry.organization,
      period: `${formatMonth(entry.startDate, locale)} — ${
        entry.endDate ? formatMonth(entry.endDate, locale) : presentLabel
      }`,
      description: entry.description[locale],
      tags: entry.tags,
    }));
  }, [timelineResource.data, locale, presentLabel]);

  const profile = profileResource.data;

  return {
    profile,
    headline: profile?.headline[locale] ?? '',
    about: profile?.about[locale] ?? '',
    location: profile?.location[locale] ?? '',
    resumeUrl: profile?.resumeUrl[locale] ?? '',
    work: items.filter((item) => item.kind === 'experiencia'),
    education: items.filter((item) => item.kind === 'educacion'),
    skills: skillsResource.data ?? [],
    isLoading: profileResource.isLoading || timelineResource.isLoading || skillsResource.isLoading,
    error: profileResource.error ?? timelineResource.error ?? skillsResource.error,
    reload: () => {
      profileResource.reload();
      timelineResource.reload();
      skillsResource.reload();
    },
  };
}
