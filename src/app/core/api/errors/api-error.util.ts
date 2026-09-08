import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api-error-response.model';
import { ApiFieldError } from '../models/api-field-error.model';

const DEFAULT_ERROR_MESSAGE =
  'No fue posible completar la operación. Intente nuevamente.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiFieldError(value: unknown): value is ApiFieldError {
  return (
    isRecord(value) &&
    typeof value['field'] === 'string' &&
    typeof value['code'] === 'string' &&
    typeof value['message'] === 'string'
  );
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value)) {
    return false;
  }

  const correlationId = value['correlationId'];
  const details = value['details'];

  return (
    typeof value['timestamp'] === 'string' &&
    typeof value['status'] === 'number' &&
    typeof value['error'] === 'string' &&
    typeof value['code'] === 'string' &&
    typeof value['message'] === 'string' &&
    typeof value['path'] === 'string' &&
    (correlationId === null || typeof correlationId === 'string') &&
    (details === undefined ||
      (Array.isArray(details) && details.every(isApiFieldError)))
  );
}

export function getApiErrorResponse(
  error: unknown
): ApiErrorResponse | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  return isApiErrorResponse(error.error) ? error.error : null;
}

export function getApiFieldErrors(error: unknown): ApiFieldError[] {
  if (error instanceof HttpErrorResponse && isRecord(error.error)) {
    const details = error.error['details'];
    if (Array.isArray(details)) {
      return details.filter(isApiFieldError);
    }
  }
  return getApiErrorResponse(error)?.details ?? [];
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const errBody = error.error;
    if (isRecord(errBody)) {
      // 1. Si el backend envió detalles de campos fallidos, construir alerta específica por campo
      const details = Array.isArray(errBody['details']) ? errBody['details'] : [];
      const validDetails = details.filter(isApiFieldError);
      if (validDetails.length > 0) {
        const issues = validDetails
          .map((d) => `Campo '${d.field}': ${d.message}`)
          .join('. ');
        return `Error en datos del formulario: ${issues}.`;
      }

      // 2. Si el backend envió mensajeUsuario
      if (typeof errBody['mensajeUsuario'] === 'string' && errBody['mensajeUsuario'].trim()) {
        return errBody['mensajeUsuario'].trim();
      }

      // 3. Si el backend envió message específico
      if (typeof errBody['message'] === 'string' && errBody['message'].trim() && errBody['message'] !== 'Error de validacion en la solicitud.') {
        return errBody['message'].trim();
      }

      // 4. Si el backend envió error descriptivo
      if (typeof errBody['error'] === 'string' && errBody['error'].trim()) {
        return errBody['error'].trim();
      }
    }

    if (error.status === 0) {
      return 'No fue posible conectar con el servidor. Verifique su conexión de red.';
    }
    if (error.status === 400) {
      return 'Los datos enviados contienen campos incompletos o con formato inválido. Verifique los campos del formulario.';
    }
    if (error.status === 404) {
      return 'El registro solicitado no fue encontrado en el sistema.';
    }
    if (error.status === 403) {
      return 'No tiene los permisos institucionales requeridos para realizar esta acción.';
    }
    if (error.status === 401) {
      return 'Su sesión institucional ha caducado. Por favor inicie sesión nuevamente.';
    }
    if (error.status === 409) {
      return 'Existe un conflicto con los datos ingresados: ya existe un registro con información idéntica en el sistema.';
    }
    if (error.status >= 500) {
      return 'Ocurrió un error en el servidor al procesar la solicitud. Por favor intente más tarde.';
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function getApiFieldError(
  error: unknown,
  field: string
): string | undefined {
  const detail = getApiFieldErrors(error).find(
    (fieldError) => fieldError.field === field
  );

  return detail?.message;
}

export function getApiCorrelationId(error: unknown): string | undefined {
  return getApiErrorResponse(error)?.correlationId ?? undefined;
}
