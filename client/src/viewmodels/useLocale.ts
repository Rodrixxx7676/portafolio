import { useContext } from 'react';
import { LocaleContext, type LocaleContextValue } from '../i18n/LocaleProvider.js';

/** ViewModel de idioma. Falla ruidosamente si se usa fuera del proveedor. */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale debe usarse dentro de <LocaleProvider>.');
  return context;
}
