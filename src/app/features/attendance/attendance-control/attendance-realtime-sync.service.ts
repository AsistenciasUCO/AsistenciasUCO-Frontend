import { Injectable, inject } from '@angular/core';
import { Observable, auditTime, filter } from 'rxjs';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import {
  AttendanceRegisteredRealtimePayload,
  REALTIME_EVENT_TYPE,
  RealtimeEvent,
} from '../../../core/realtime/model/realtime-event.model';

/** Ventana de coalescencia para no disparar una recarga por cada evento de
 * una ráfaga (ej. registro masivo consecutivo sobre el mismo grupo/sesión). */
export const ATTENDANCE_REALTIME_COALESCE_MS = 250;

/**
 * Filtra `ASISTENCIA_REGISTRADA` a los eventos que pertenecen al
 * grupo/sesión actualmente visibles en `AttendanceControlComponent`, y
 * coalesce ráfagas. Extraído como clase propia para poder probarlo sin
 * instanciar el componente completo (que además de esto orquesta
 * matrícula, sesiones y formularios).
 */
@Injectable({ providedIn: 'root' })
export class AttendanceRealtimeSyncService {
  private readonly realtimeService = inject(RealtimeService);

  watch(
    getGroupId: () => string,
    getSessionId: () => string
  ): Observable<RealtimeEvent<AttendanceRegisteredRealtimePayload>> {
    return this.realtimeService
      .listenType<AttendanceRegisteredRealtimePayload>(
        REALTIME_EVENT_TYPE.ASISTENCIA_REGISTRADA
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
  }
}
