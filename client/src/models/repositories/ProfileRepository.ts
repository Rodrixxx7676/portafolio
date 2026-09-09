import type { Profile, SkillCategory, TimelineEntry } from '@portafolio/shared';
import { getJson } from './HttpClient.js';

/** Datos personales: perfil, trayectoria y habilidades. */
export const ProfileRepository = {
  profile: (signal?: AbortSignal) => getJson<Profile>('/api/profile', signal),
  timeline: (signal?: AbortSignal) => getJson<TimelineEntry[]>('/api/timeline', signal),
  skills: (signal?: AbortSignal) => getJson<SkillCategory[]>('/api/skills', signal),
};
