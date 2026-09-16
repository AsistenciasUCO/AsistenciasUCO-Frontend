import { Injectable, inject } from '@angular/core';
import { Observable, auditTime, filter, map, merge, pairwise } from 'rxjs';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import {
  AttendanceSessionUpdatedRealtimePayload,
  REALTIME_EVENT_TYPE,
  RealtimeEvent,
} from '../../../core/realtime/model/realtime-event.model';

/** Ventana de coalescencia para no disparar una recarga por cada evento de
 * una ráfaga (ej. registro masivo consecutivo sobre el mismo grupo/sesión). */
export const ATTENDANCE_REALTIME_COALESCE_MS = 250;

/**
 * Filtra `ASISTENCIAS_SESION_ACTUALIZADAS` a los eventos que pertenecen al
 * grupo/sesión actualmente visibles en `AttendanceControlComponent`, y
 * coalesce ráfagas. Extraído como clase propia para poder probarlo sin
 * instanciar el componente completo (que además de esto orquesta
 * matrícula, sesiones y formularios).
 */
@Injectable({ providedIn: 'root' })
export class AttendanceRealtimeSyncService {
  private readonly realtimeService = inject(RealtimeService);

  connectGroup(grupoId: string): void {
    this.realtimeService.startForGroup(grupoId);
  }

  disconnect(): void {
    this.realtimeService.stop();
  }

  watch(
    getGroupId: () => string,
    getSessionId: () => string
  ): Observable<RealtimeEvent<AttendanceSessionUpdatedRealtimePayload> | void> {
    const businessEvent$ = this.realtimeService
      .listenType<AttendanceSessionUpdatedRealtimePayload>(
        REALTIME_EVENT_TYPE.ASISTENCIAS_SESION_ACTUALIZADAS
      )
      .pipe(
        filter((evt) => {
          const groupId = getGroupId();
          const sessionId = getSessionId();
          return (
            !!groupId &&
            !!sessionId &&
            evt.payload?.grupo === groupId &&
            evt.payload?.sesion === sessionId
          );
        }),
        auditTime(ATTENDANCE_REALTIME_COALESCE_MS)
      );

    const reconnected$ = this.realtimeService.connectionState$.pipe(
      pairwise(),
      filter(
        ([previous, current]) =>
          previous === 'RECONNECTING' && current === 'CONNECTED'
      ),
      map(() => undefined)
    );

    return merge(businessEvent$, reconnected$);
  }
}
