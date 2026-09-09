import { useCallback, useEffect, useState } from 'react';

/** Estado de una lectura remota, tal como lo consume la vista. */
export interface AsyncResource<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Base de los ViewModels que leen de la API.
 *
 * Concentra el ciclo cargando/éxito/error y la cancelación al desmontar, para
 * que cada ViewModel concreto solo se ocupe de transformar los datos.
 */
export function useAsyncResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // El loader suele ser una lambda nueva en cada render: las dependencias
  // reales las declara quien llama al hook.
  const stableLoader = useCallback(loader, deps);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    stableLoader(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [stableLoader, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, isLoading, error, reload };
}
