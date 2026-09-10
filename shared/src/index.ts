/**
 * Contrato de dominio compartido entre el servidor (Model) y el cliente (Model).
 *
 * Estos tipos son la única fuente de verdad de la forma de los datos que viajan
 * por la API. Al vivir en un workspace propio, cualquier cambio de forma rompe
 * la compilación de ambos lados en vez de fallar en runtime.
 */

/** Idiomas soportados por el sitio. */
export type Locale = 'es' | 'en';

/** Texto que existe en los dos idiomas del sitio. */
export type LocalizedText = Record<Locale, string>;

/** Estado de madurez de un proyecto, usado para el badge de la tarjeta. */
export type ProjectStatus = 'produccion' | 'activo' | 'archivado' | 'experimento';

/**
 * Proyecto tal como lo consume la vista.
 * Mezcla los datos curados del catálogo local con los datos vivos de GitHub.
 */
export interface Project {
  /** Identificador estable usado en las rutas y como key de React. */
  id: string;
  title: string;
  summary: LocalizedText;
  /** Tecnologías destacadas, curadas a mano (no las que infiere GitHub). */
  tags: string[];
  status: ProjectStatus;
  /** `owner/repo` en GitHub. Ausente si el proyecto no es público. */
  repo?: string;
  /** URL del código fuente. Se deriva de `repo` cuando existe. */
  repoUrl?: string;
  /** URL de la demo desplegada, si la hay. Es el destino preferido del CTA. */
  demoUrl?: string;
  /** Imagen de portada opcional (ruta pública o URL absoluta). */
  coverImage?: string;
  /** Datos vivos traídos de GitHub. `null` si el repo no existe o falló la API. */
  github: GithubStats | null;
  /** El proyecto se destaca en la parte superior del listado. */
  featured: boolean;
}

/** Métricas públicas del repositorio, refrescadas periódicamente desde GitHub. */
export interface GithubStats {
  stars: number;
  forks: number;
  /** Lenguaje principal según GitHub, p. ej. "TypeScript". */
  language: string | null;
  /** Descripción del repo en GitHub (fallback si falta el resumen curado). */
  description: string | null;
  topics: string[];
  /** ISO 8601 del último push al repositorio. */
  pushedAt: string | null;
  /** URL de GitHub Pages u homepage declarada en el repo. */
  homepage: string | null;
}

/**
 * Documentación de un proyecto para la ventana flotante.
 * `html` ya viene renderizado por GitHub y saneado por el servidor.
 */
export interface ProjectDocumentation {
  projectId: string;
  /** HTML seguro listo para inyectar. Vacío si no hay README. */
  html: string;
  /** Origen del contenido, útil para mostrar un aviso en la UI. */
  source: 'github' | 'local' | 'none';
  /** URL para "ver el proyecto real": demo si existe, si no el repositorio. */
  primaryUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
}

/** Bloque "Sobre mí" del encabezado y la sección de presentación. */
export interface Profile {
  name: string;
  headline: LocalizedText;
  about: LocalizedText;
  location: LocalizedText;
  email: string;
  /** Teléfono en formato legible, tal como se muestra en pantalla. */
  phone?: string;
  /** Enlace directo a WhatsApp (wa.me con el número sin signos). */
  whatsappUrl?: string;
  linkedinUrl: string;
  githubUrl: string;
  /** Ruta pública al CV en PDF, p. ej. "/cv/francisco-cv.pdf". */
  resumeUrl: LocalizedText;
  avatarUrl?: string;
}

/** Entrada de la línea de tiempo de experiencia o educación. */
export interface TimelineEntry {
  id: string;
  kind: 'experiencia' | 'educacion';
  role: LocalizedText;
  organization: string;
  /** Formato "YYYY-MM". */
  startDate: string;
  /** Formato "YYYY-MM". `null` significa "actualidad". */
  endDate: string | null;
  description: LocalizedText;
  tags: string[];
}

/** Categoría de habilidades técnicas mostrada en la sección Skills. */
export interface SkillCategory {
  id: string;
  name: LocalizedText;
  skills: Skill[];
}

export interface Skill {
  name: string;
  /** 1 a 5. Se dibuja como barra o puntos en la vista. */
  level: number;
}

/** Envoltorio uniforme de toda respuesta de la API. */
export type ApiResponse<T> = { data: T } | { error: ApiError };

export interface ApiError {
  code: string;
  message: string;
}
