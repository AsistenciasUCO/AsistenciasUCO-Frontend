/**
 * Contrato exacto del evento de negocio publicado por
 * `GET /api/v1/realtime/stream` (campo SSE `data`, serializado como JSON).
 * Los nombres de campo son los del backend; no se renombran para "encajar"
 * con el frontend legacy (eventId -> id, type -> topic/action, etc.).
 */
export interface RealtimeEvent<TPayload = unknown> {
  eventId: string;
  type: string;
  occurredAt: string;
  correlationId: string | null;
  payload: TPayload;
}

/** Único evento de negocio actualmente conectado por el backend. */
export const REALTIME_EVENT_TYPE = {
  ASISTENCIA_REGISTRADA: 'ASISTENCIA_REGISTRADA',
} as const;

export type RealtimeEventType =
  (typeof REALTIME_EVENT_TYPE)[keyof typeof REALTIME_EVENT_TYPE];

/** payload de `ASISTENCIA_REGISTRADA`, publicado desde el flujo individual
 * `POST /api/v1/asistencias` (no desde `/asistencias/lote`). */
export interface AttendanceRegisteredRealtimePayload {
  estudiante: string;
  grupo: string;
  sesion: string;
  presente: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Valida la forma mínima de un `RealtimeEvent` recibido por el transporte,
 * antes de emitirlo a las features. `correlationId` puede ser `null`.
 */
export function isValidRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (!isRecord(value)) return false;

  const correlationId = value['correlationId'];

  return (
    typeof value['eventId'] === 'string' &&
    typeof value['type'] === 'string' &&
    typeof value['occurredAt'] === 'string' &&
    (correlationId === null || typeof correlationId === 'string') &&
    'payload' in value
  );
}
