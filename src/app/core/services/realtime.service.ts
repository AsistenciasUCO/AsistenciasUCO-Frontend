import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, filter } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RealtimeEventPayload<T = any> {
  id: string;
  topic: string;
  action: string;
  timestamp: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  private eventSource: EventSource | null = null;
  private readonly eventsSubject = new Subject<RealtimeEventPayload>();
  private isConnected = false;
  private reconnectTimer: any = null;

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  /**
   * Conecta al endpoint SSE del backend para recibir actualizaciones reactivas push.
   */
  connect(): void {
    if (typeof window === 'undefined' || !('EventSource' in window)) {
      return;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    const clientId = 'client-' + Math.random().toString(36).substring(2, 9);
    const streamUrl = `${environment.apiUrl}/realtime/stream?clientId=${clientId}`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.addEventListener('CONNECTED', (e: MessageEvent) => {
        this.isConnected = true;
        // Se ejecuta dentro de la zona de Angular para asegurar detección de cambios
        this.ngZone.run(() => {
          // Conectado exitosamente
        });
      });

      this.eventSource.addEventListener('DATA_CHANGE', (e: MessageEvent) => {
        try {
          const payload: RealtimeEventPayload = JSON.parse(e.data);
          this.ngZone.run(() => {
            this.eventsSubject.next(payload);
          });
        } catch (err) {
          console.error('[RealtimeService] Error parseando payload SSE:', err);
        }
      });

      this.eventSource.addEventListener('PING', () => {
        this.isConnected = true;
      });

      this.eventSource.onerror = (err) => {
        this.isConnected = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Intentar reconectar automáticamente tras 5 segundos
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 5000);
        }
      };
    } catch (err) {
      console.warn('[RealtimeService] Error inicializando EventSource:', err);
    }
  }

  /**
   * Escucha todos los eventos de un tópico específico (ej. 'PERIODOS', 'PLANES', 'ASISTENCIA').
   */
  listenTopic<T = any>(topic: string): Observable<RealtimeEventPayload<T>> {
    return this.eventsSubject.asObservable().pipe(
      filter((evt) => evt.topic.toUpperCase() === topic.toUpperCase())
    );
  }

  /**
   * Escucha todas las notificaciones reactivas.
   */
  listenAll(): Observable<RealtimeEventPayload> {
    return this.eventsSubject.asObservable();
  }

  /**
   * Estado de la conexión SSE.
   */
  get active(): boolean {
    return this.isConnected;
  }
}
