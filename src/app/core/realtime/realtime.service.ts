import { Inject, Injectable } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { REALTIME_TRANSPORT, RealtimeTransport } from './contract/realtime-transport';
import { RealtimeEvent, RealtimeEventType } from './model/realtime-event.model';
import { RealtimeConnectionState } from './model/realtime-connection-state.model';

/**
 * Fachada semántica sobre el transporte realtime. Las features solo
 * conocen esta clase: no `fetch`, no `AbortController`, no chunks crudos,
 * no cabecera `Authorization`, no política de reconexión.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  readonly connectionState$: Observable<RealtimeConnectionState>;

  constructor(@Inject(REALTIME_TRANSPORT) private readonly transport: RealtimeTransport) {
    this.connectionState$ = this.transport.connectionState$;
  }

  /** Todos los eventos de negocio recibidos, sin filtrar por tipo. */
  events(): Observable<RealtimeEvent> {
    return this.transport.events$;
  }

  /** Suscripción filtrada por `type` (match exacto, sin normalizar casing). */
  listenType<T = unknown>(type: RealtimeEventType | string): Observable<RealtimeEvent<T>> {
    return this.transport.events$.pipe(
      filter((evt): evt is RealtimeEvent<T> => evt.type === type)
    );
  }

  /** Idempotente. Inicia la conexión (no-op si ya está iniciada). */
  start(): void {
    this.transport.start();
  }

  /** Termina la conexión y cancela cualquier reintento pendiente. */
  stop(): void {
    this.transport.stop();
  }
}
