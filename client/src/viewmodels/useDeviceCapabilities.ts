import { useEffect, useState } from 'react';

/** Lo que el sitio necesita saber del equipo del visitante. */
export interface DeviceCapabilities {
  /** Pantalla ancha: a partir de aquí se sirve el vídeo de apertura. */
  isDesktop: boolean;
  /** El visitante pidió ahorrar datos o tiene una conexión lenta. */
  savesData: boolean;
  /** Se puede reproducir el vídeo de fondo sin castigar al visitante. */
  canPlayHeroVideo: boolean;
}

interface ConnectionLike {
  saveData?: boolean;
  effectiveType?: string;
}

/** Lee el modo de ahorro de datos y el tipo de conexión, si el navegador los expone. */
function readConnection(): ConnectionLike {
  const nav = navigator as Navigator & { connection?: ConnectionLike };
  return nav.connection ?? {};
}

/**
 * Decide si toca cargar el vídeo de apertura.
 *
 * Son tres megas: en un móvil con datos móviles es una factura que el visitante
 * no pidió, y encima el efecto de scroll apenas se aprecia en una pantalla
 * pequeña. Ahí se queda el fotograma fijo, que pesa cincuenta kilobytes.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );

  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 768px)');
    const onChange = (event: MediaQueryListEvent): void => setIsDesktop(event.matches);
    consulta.addEventListener('change', onChange);
    return () => consulta.removeEventListener('change', onChange);
  }, []);

  const conexion = readConnection();
  const savesData = Boolean(conexion.saveData) || /^(slow-)?2g$/.test(conexion.effectiveType ?? '');

  return { isDesktop, savesData, canPlayHeroVideo: isDesktop && !savesData };
}
