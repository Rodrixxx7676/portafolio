import { useEffect } from 'react';
import { AnalyticsRepository } from './models/repositories/AnalyticsRepository.js';
import { ClickSpark } from './views/components/ClickSpark.js';
import { DarkVeil } from './views/components/DarkVeil.js';
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

  // Una visita por carga de página. No hay cookies ni identificadores.
  useEffect(() => {
    AnalyticsRepository.track('pageview', window.location.pathname);
  }, []);

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
        Velo de nubes rojas sobre blanco, fijo y detrás de todo. Va en modo
        claro y con el tono girado 241 grados: el shader nace violeta y ese es
        el giro que lo deja en rojo puro, medido píxel a píxel (con 90, el valor
        intuitivo, salía verde). A media resolución, para que cueste la cuarta
        parte, y algo atenuado para que el texto conserve su contraste encima.
      */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-75">
        <DarkVeil lightMode hueShift={241} speed={0.25} warpAmount={0.6} resolutionScale={0.5} />
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

      {/* Chispas rojas en cada clic, sobre toda la página. */}
      <ClickSpark sparkColor="#b40808" sparkSize={11} sparkRadius={18} sparkCount={8} duration={420} />
    </div>
  );
}
