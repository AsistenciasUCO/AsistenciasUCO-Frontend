import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  EventSourceMessage,
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { RealtimeTransport } from '../../contract/realtime-transport';
import { RealtimeEvent, isValidRealtimeEvent } from '../../model/realtime-event.model';
import { RealtimeConnectionState } from '../../model/realtime-connection-state.model';

/** Backoff acotado para errores de red: 1s, 2s, 5s, 10s, luego 30s como techo. */
const RECONNECT_BACKOFF_MS = [1000, 2000, 5000, 10000, 30000];
const MIN_TOKEN_VALIDITY_SECONDS = 30;

class UnauthorizedStreamError extends Error {}
class ForbiddenStreamError extends Error {}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
}

/**
 * Transporte SSE autenticado hacia `GET /api/v1/realtime/stream`, construido
 * sobre `@microsoft/fetch-event-source` (permite enviar `Authorization`,
 * cosa que `EventSource` nativo no soporta). Posee en exclusiva: la petición
 * fetch, el parseo SSE, el header Bearer y la política de reconexión.
 */
@Injectable()
export class FetchSseRealtimeTransport implements RealtimeTransport {
  private readonly eventsSubject = new Subject<RealtimeEvent>();
  private readonly stateSubject = new BehaviorSubject<RealtimeConnectionState>(
    'DISCONNECTED'
  );

  readonly events$: Observable<RealtimeEvent> = this.eventsSubject.asObservable();
  readonly connectionState$: Observable<RealtimeConnectionState> =
    this.stateSubject.asObservable();

  private abortController: AbortController | null = null;
  private running = false;
  private reconnectAttempt = 0;

  constructor(private authService: AuthService, private ngZone: NgZone) {}

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.reconnectAttempt = 0;
    this.ngZone.runOutsideAngular(() => {
      void this.runLoop();
    });
  }

  stop(): void {
    this.running = false;
    this.abortController?.abort();
    this.abortController = null;
    this.setState('DISCONNECTED');
  }

  private setState(state: RealtimeConnectionState): void {
    this.ngZone.run(() => this.stateSubject.next(state));
  }

  private async runLoop(): Promise<void> {
    while (this.running) {
      if (environment.useMocks) {
        this.setState('DISCONNECTED');
        return;
      }

      const token = await this.authService.getValidAccessToken(
        MIN_TOKEN_VALIDITY_SECONDS
      );
      if (!token) {
        this.setState('DISCONNECTED');
        return;
      }
      if (!this.running) {
        return;
      }

      this.setState(this.reconnectAttempt > 0 ? 'RECONNECTING' : 'CONNECTING');
      this.abortController = new AbortController();

      try {
        await fetchEventSource(`${environment.apiUrl}/realtime/stream`, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
            'X-Correlation-Id': crypto.randomUUID(),
          },
          credentials: 'omit',
          openWhenHidden: true,
          signal: this.abortController.signal,
          onopen: async (response) => {
            const contentType = response.headers.get('content-type') || '';
            if (response.ok && contentType.startsWith(EventStreamContentType)) {
              this.reconnectAttempt = 0;
              this.setState('CONNECTED');
              return;
            }
            if (response.status === 401) {
              throw new UnauthorizedStreamError();
            }
            if (response.status === 403) {
              throw new ForbiddenStreamError();
            }
            throw new Error(
              `Respuesta inesperada del stream realtime: HTTP ${response.status}`
            );
          },
          onmessage: (msg) => this.handleMessage(msg),
          onerror: (err) => {
            // Relanzar SIEMPRE: nunca delegar la política de reintento a la
            // librería, la gobierna este bucle exclusivamente.
            throw err;
          },
        });

        // El servidor cerró el stream sin error (ej. ciclo de vida del LB):
        // tratar como recuperable y reconectar con backoff.
        if (!this.running) {
          return;
        }
        await this.waitBeforeReconnect();
      } catch (err) {
        if (!this.running || isAbortError(err)) {
          return;
        }

        if (err instanceof UnauthorizedStreamError) {
          const refreshed = await this.authService.refreshAccessToken();
          if (refreshed && this.running) {
            continue;
          }
          this.setState('UNAUTHORIZED');
          this.running = false;
          return;
        }

        if (err instanceof ForbiddenStreamError) {
          this.setState('ERROR');
          this.running = false;
          return;
        }

        await this.waitBeforeReconnect();
      }
    }
  }

  private async waitBeforeReconnect(): Promise<void> {
    if (!this.running || !this.abortController) {
      return;
    }
    const delay =
      RECONNECT_BACKOFF_MS[
        Math.min(this.reconnectAttempt, RECONNECT_BACKOFF_MS.length - 1)
      ];
    this.reconnectAttempt++;
    this.setState('RECONNECTING');
    const jitter = Math.random() * 250;
    await sleep(delay + jitter, this.abortController.signal);
  }

  private handleMessage(msg: EventSourceMessage): void {
    // Los comentarios `:heartbeat` nunca llegan aquí: el parser SSE de
    // fetch-event-source los descarta antes de invocar onmessage (no tienen
    // campo `data`), por lo que no requieren manejo explícito.
    if (!msg.data) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(msg.data);
    } catch {
      console.warn('[Realtime] Payload SSE no es JSON válido; evento descartado.');
      return;
    }

    if (!isValidRealtimeEvent(parsed)) {
      console.warn('[Realtime] Evento SSE con forma inválida; evento descartado.');
      return;
    }

    if (msg.event && parsed.type && msg.event !== parsed.type) {
      console.warn(
        `[Realtime] Inconsistencia entre el campo SSE "event" (${msg.event}) y "data.type" (${parsed.type}); evento descartado.`
      );
      return;
    }

    this.ngZone.run(() => this.eventsSubject.next(parsed));
  }
}
