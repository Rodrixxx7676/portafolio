import { Footer } from './views/components/Footer.js';
import Galaxy from './views/components/Galaxy.js';
import { Header } from './views/components/Header.js';
import { ProjectModal } from './views/components/ProjectModal.js';
import { AboutSection } from './views/sections/AboutSection.js';
import { ContactSection } from './views/sections/ContactSection.js';
import { ExperienceSection } from './views/sections/ExperienceSection.js';
import { HeroSection } from './views/sections/HeroSection.js';
import { ProjectsSection } from './views/sections/ProjectsSection.js';
import { SkillsSection } from './views/sections/SkillsSection.js';
import { useLocale } from './viewmodels/useLocale.js';
import { useProfileViewModel } from './viewmodels/useProfileViewModel.js';
import { useProjectDocumentationViewModel } from './viewmodels/useProjectDocumentationViewModel.js';
import { useProjectsViewModel } from './viewmodels/useProjectsViewModel.js';

/**
 * Composición de la página.
 *
 * Aquí solo se instancian los ViewModels y se reparten a las vistas: ningún
 * componente de esta capa habla directamente con la API ni transforma datos.
 */
export function App(): JSX.Element {
  const { locale, t } = useLocale();

  const profileVm = useProfileViewModel(locale, t('experience.present'));
  const projectsVm = useProjectsViewModel(locale);
  const documentationVm = useProjectDocumentationViewModel();

  const name = profileVm.profile?.name ?? '';

  const hiddenSections = [
    ...(profileVm.work.length === 0 && profileVm.education.length === 0
      ? (['experience'] as const)
      : []),
    ...(profileVm.skills.length === 0 ? (['skills'] as const) : []),
  ];

  return (
    <div className="min-h-screen">
      {/*
        Campo de estrellas de fondo. Va fijo y detrás de todo, y no intercepta
        clics: el vídeo del inicio lo tapa en la primera pantalla y aparece a
        partir de ahí. Las estrellas se apartan del cursor porque el componente
        escucha el ratón en la ventana, no en su propio lienzo.
      */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <Galaxy
          density={1.1}
          hueShift={0}
          saturation={0.55}
          glowIntensity={0.35}
          starSpeed={0.3}
          rotationSpeed={0.06}
          twinkleIntensity={0.5}
          mouseInteraction
          mouseRepulsion
          repulsionStrength={2.5}
          transparent
        />
      </div>

      <Header name={name} hiddenSections={[...hiddenSections]} />

      <main>
        <HeroSection
          name={name}
          headline={profileVm.headline}
          location={profileVm.location}
          resumeUrl={profileVm.resumeUrl}
        />
        <ProjectsSection viewModel={projectsVm} onOpenProject={documentationVm.open} />
        <AboutSection about={profileVm.about} />
        <ExperienceSection work={profileVm.work} education={profileVm.education} />
        <SkillsSection categories={profileVm.skills} />
        <ContactSection profile={profileVm.profile} resumeUrl={profileVm.resumeUrl} />
      </main>

      <Footer name={name} />
      <ProjectModal viewModel={documentationVm} />
    </div>
  );
}
