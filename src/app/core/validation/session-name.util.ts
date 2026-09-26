/**
 * Sesion.nombre según BACKEND_GOLDEN_PATH_CONTRACT §C: string requerido,
 * minLength=1, maxLength=50. El frontend valida antes de enviar; no se
 * delega el rechazo de 51+ caracteres al backend.
 */
export const SESSION_NAME_MIN_LENGTH = 1;
export const SESSION_NAME_MAX_LENGTH = 50;

export const SESSION_NAME_LENGTH_MESSAGE =
  'El título de la sesión debe tener entre 1 y 50 caracteres.';

/** Devuelve el mensaje de error, o `null` si el nombre (recortado) es válido. */
export function getSessionNameError(nombre: string | null | undefined): string | null {
  const trimmed = (nombre ?? '').trim();
  if (trimmed.length < SESSION_NAME_MIN_LENGTH) {
    return 'El campo Título de la Sesión es obligatorio.';
  }
  if (trimmed.length > SESSION_NAME_MAX_LENGTH) {
    return SESSION_NAME_LENGTH_MESSAGE;
  }
  return null;
}
