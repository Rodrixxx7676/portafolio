import type { ApiResponse } from '@portafolio/shared';

/** Error de red o de API con la información mínima para mostrarla en pantalla. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Cliente HTTP de la capa Model.
 *
 * Desenvuelve el `{ data }` / `{ error }` que devuelve la API para que los
 * repositorios trabajen con el tipo de dominio directamente.
 */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('No se pudo conectar con el servidor.', 'NETWORK_ERROR');
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError('El servidor devolvió una respuesta inválida.', 'INVALID_RESPONSE');
  }

  if ('error' in body) throw new ApiRequestError(body.error.message, body.error.code);
  if (!response.ok) throw new ApiRequestError(`Error ${response.status}.`, 'HTTP_ERROR');
  return body.data;
}
