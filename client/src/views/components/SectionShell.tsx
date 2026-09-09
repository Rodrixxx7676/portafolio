import type { ReactNode } from 'react';

/** Envoltorio común de las secciones: ancla, ancho máximo y encabezado. */
export function SectionShell({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
          <span className="text-accent">.</span>
        </h2>
        {subtitle ? <p className="mt-2 text-sm text-ink-muted">{subtitle}</p> : null}
        <div className="mt-4 h-px w-16 bg-accent" />
      </div>
      {children}
    </section>
  );
}
