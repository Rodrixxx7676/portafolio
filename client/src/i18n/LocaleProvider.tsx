import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale, LocalizedText } from '@portafolio/shared';
import { translations, type TranslationKey } from './translations.js';

/** Contrato que consumen las vistas para traducir texto y cambiar de idioma. */
export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Etiqueta de UI por clave. */
  t: (key: TranslationKey) => string;
  /** Campo bilingüe que viene de la API. */
  tx: (text: LocalizedText | undefined) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'portafolio.locale';

/** Idioma inicial: el guardado por el visitante, si no el del navegador. */
function detectInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
  } catch {
    // Modo privado o cookies bloqueadas: se cae al idioma del navegador.
  }
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function LocaleProvider({ children }: { children: ReactNode }): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // La preferencia se pierde entre visitas, pero la sesión sigue funcionando.
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const toggleLocale = useCallback(
    () => setLocaleState((current) => (current === 'es' ? 'en' : 'es')),
    [],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (key) => translations[locale][key],
      tx: (text) => text?.[locale] ?? '',
    }),
    [locale, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
