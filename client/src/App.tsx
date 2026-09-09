import { Footer } from './views/components/Footer.js';
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

  return (
    <div className="min-h-screen">
      <Header name={name} />

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
