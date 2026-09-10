import { useCallback, useEffect, useRef, useState } from 'react';

/** Estado del botón de copiar: en reposo, copiado o sin permiso. */
export type CopyState = 'idle' | 'copied' | 'failed';

export interface CopyToClipboard {
  state: CopyState;
  copy: (text: string) => void;
}

/**
 * Método antiguo de copiado, con un campo de texto oculto.
 *
 * Sigue haciendo falta por dos motivos: la API moderna del portapapeles solo
 * existe en contextos seguros —y el sitio se sirve por HTTP mientras no tenga
 * certificado— y, aun existiendo, puede denegar el permiso.
 */
function copiarConMetodoAntiguo(text: string): boolean {
  try {
    const campo = document.createElement('textarea');
    campo.value = text;
    campo.setAttribute('readonly', '');
    campo.style.position = 'fixed';
    campo.style.top = '0';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    campo.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(campo);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Copia un texto al portapapeles y avisa del resultado durante unos segundos.
 *
 * Existe porque `mailto:` no lleva a ninguna parte en un equipo sin cliente de
 * correo configurado, que es el caso de mucha gente que navega desde el
 * trabajo: sin esto, ese visitante se queda sin forma de guardar la dirección.
 */
export function useCopyToClipboard(resetMs = 2500): CopyToClipboard {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    (text: string) => {
      clearTimeout(timer.current);
      const finish = (ok: boolean): void => {
        setState(ok ? 'copied' : 'failed');
        timer.current = setTimeout(() => setState('idle'), resetMs);
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => finish(true))
          // Que la API moderna diga que no todavía no es el final: el método
          // antiguo funciona en varios de los casos en los que ella falla.
          .catch(() => finish(copiarConMetodoAntiguo(text)));
        return;
      }

      finish(copiarConMetodoAntiguo(text));
    },
    [resetMs],
  );

  return { state, copy };
}
