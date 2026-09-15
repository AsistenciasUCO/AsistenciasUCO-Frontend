import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { RealtimeEvent } from '../model/realtime-event.model';
import { RealtimeConnectionState } from '../model/realtime-connection-state.model';

/**
 * Puerto entre `RealtimeService` y el mecanismo de transporte real
 * (SSE hoy, potencialmente WebSocket mañana). Las features solo conocen
 * `RealtimeService`; ni siquiera `RealtimeService` conoce los detalles de
 * fetch/SSE/reconexión, que viven exclusivamente en el adapter.
 */
export interface RealtimeTransport {
  readonly events$: Observable<RealtimeEvent>;
  readonly connectionState$: Observable<RealtimeConnectionState>;

  /** Idempotente: si ya hay una conexión/intento en curso, no abre una segunda. */
  start(): void;

  /** Aborta el transporte y cancela cualquier reintento pendiente. */
  stop(): void;
}

export const REALTIME_TRANSPORT = new InjectionToken<RealtimeTransport>(
  'REALTIME_TRANSPORT'
);
