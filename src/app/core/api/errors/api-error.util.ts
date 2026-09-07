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

export function getApiErrorMessage(error: unknown): string {
  return getApiErrorResponse(error)?.message ?? DEFAULT_ERROR_MESSAGE;
}

export function getApiFieldErrors(error: unknown): ApiFieldError[] {
  return getApiErrorResponse(error)?.details ?? [];
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
