import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiListResponse } from '../api/models/api-list-response.model';
import { ApiMessageResponse } from '../api/models/api-message-response.model';
import { SesionConsultadaApiDto } from '../api/models/sesion-consultada-api-dto.model';
import { ClassSession } from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private initialSessions: Record<string, ClassSession[]> = {
    'crs-1': [
      {
        id: 'ses-101',
        courseId: 'crs-1',
        sessionNumber: 1,
        date: '2026-08-25',
        startTime: '08:00',
        endTime: '10:00',
        room: 'Aula A-204',
        tipo: 'REGULAR',
        title: 'Introducción al Cálculo Multivariado',
        topic: 'Conceptos fundamentales de funciones de varias variables y límites',
        status: 'CONCLUIDA',
        records: [],
      },
      {
        id: 'ses-102',
        courseId: 'crs-1',
        sessionNumber: 2,
        date: '2026-08-27',
        startTime: '08:00',
        endTime: '10:00',
        room: 'Aula A-204',
        tipo: 'REGULAR',
        title: 'Derivadas Parciales y Gradiente',
        topic: 'Regla de la cadena y aplicaciones del gradiente en campos escalares',
        status: 'CONCLUIDA',
        records: [],
      },
      {
        id: 'ses-103',
        courseId: 'crs-1',
        sessionNumber: 3,
        date: '2026-09-01',
        startTime: '08:00',
        endTime: '10:00',
        room: 'Aula A-204',
        tipo: 'REGULAR',
        title: 'Optimización y Multiplicadores de Lagrange',
        topic: 'Extremos condicionados con restricciones',
        status: 'PROGRAMADA',
        records: [],
      },
      {
        id: 'ses-104',
        courseId: 'crs-1',
        sessionNumber: 4,
        date: '2026-09-05',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Laboratorio L-102',
        tipo: 'EXTRAORDINARIA',
        title: 'Taller Extraordinario de Nivelación',
        topic: 'Resolución de problemas previos al primer examen parcial',
        status: 'PROGRAMADA',
        records: [],
      },
    ],
    'crs-2': [
      {
        id: 'ses-201',
        courseId: 'crs-2',
        sessionNumber: 1,
        date: '2026-08-26',
        startTime: '10:30',
        endTime: '12:30',
        room: 'Laboratorio L-102',
        tipo: 'REGULAR',
        title: 'Dualidad Onda-Partícula',
        topic: 'Experimento de Young y efecto fotoeléctrico',
        status: 'CONCLUIDA',
        records: [],
      },
      {
        id: 'ses-202',
        courseId: 'crs-2',
        sessionNumber: 2,
        date: '2026-09-02',
        startTime: '10:30',
        endTime: '12:30',
        room: 'Laboratorio L-102',
        tipo: 'REGULAR',
        title: 'Ecuación de Schrödinger en una Dimensión',
        topic: 'Pozos de potencial infinito y cuantización de energía',
        status: 'PROGRAMADA',
        records: [],
      },
    ],
  };

  private sessionsByGroupSignal = signal<Record<string, ClassSession[]>>(this.initialSessions);

  constructor(private http: HttpClient) {}

  getSessionsByGroup(grupoId: string): Observable<ApiResponse<ClassSession[]>> {
    if (environment.useMocks) {
      const map = this.sessionsByGroupSignal();
      const existing = map[grupoId];
      const list = existing || [
        {
          id: `ses-${grupoId}-1`,
          courseId: grupoId,
          sessionNumber: 1,
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '10:00',
          room: 'Aula Asignada',
          tipo: 'REGULAR',
          title: 'Sesión Inaugural del Curso',
          topic: 'Presentación del programa académico y concertación de evaluación',
          status: 'PROGRAMADA',
          records: [],
        },
      ];

      return of({
        idTransaccion: `mock-tx-ses-${grupoId}`,
        exitoso: true,
        total: list.length,
        datos: [...list],
      }).pipe(delay(200));
    }

    return this.http
      .get<ApiListResponse<SesionConsultadaApiDto>>(
        `${environment.apiUrl}/sesiones/grupo/${grupoId}`
      )
      .pipe(
        map((response) => {
          const sessions: ClassSession[] = response.datos.map((session) => ({
            id: session.sesion,
            courseId: session.grupo,
            sessionNumber: session.numero,
            title: session.nombre,
            topic: session.nombre,
            date: session.fechaHoraInicio,
            startTime: session.fechaHoraInicio,
            endTime: session.fechaHoraFin,
            status: 'PROGRAMADA',
            records: [],
          }));

          return {
            exitoso: response.exitoso,
            total: sessions.length,
            datos: sessions,
          };
        })
      );
  }

  createSession(
    grupoId: string,
    data: {
      title: string;
      topic: string;
      date: string;
      startTime: string;
      endTime: string;
      room?: string;
      tipo?: 'REGULAR' | 'EXTRAORDINARIA' | 'REPOSICION';
    }
  ): Observable<ApiMessageResponse> {
    if (environment.useMocks) {
      const currentList = this.sessionsByGroupSignal()[grupoId] || [];
      const sessionNumber = currentList.length + 1;
      const newSession: ClassSession = {
        id: `mock-ses-${sessionNumber}`,
        courseId: grupoId,
        sessionNumber,
        title: data.title,
        topic: data.topic,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || 'Aula Asignada',
        tipo: data.tipo || 'EXTRAORDINARIA',
        status: 'PROGRAMADA',
        records: [],
      };

      this.sessionsByGroupSignal.update((map) => ({
        ...map,
        [grupoId]: [...(map[grupoId] || []), newSession],
      }));

      const tipoStr = (newSession.tipo || 'EXTRAORDINARIA').toLowerCase();
      return of({
        exitoso: true,
        mensaje: `Sesión ${tipoStr} #${sessionNumber} programada correctamente.`,
      }).pipe(delay(250));
    }

    return this.http.post<ApiMessageResponse>(`${environment.apiUrl}/sesiones`, {
        grupo: grupoId,
        nombre: data.title,
        descripcion: data.topic,
        fechaHoraInicio: `${data.date}T${data.startTime}:00`,
        fechaHoraFin: `${data.date}T${data.endTime}:00`,
        aula: data.room,
        tipo: data.tipo,
      });
  }

  updateSession(
    grupoId: string,
    sesionId: string,
    cambios: Partial<ClassSession>
  ): Observable<ApiResponse<ClassSession>> {
    if (environment.useMocks) {
      let updated: ClassSession | null = null;
      this.sessionsByGroupSignal.update((map) => {
        const list = map[grupoId] || [];
        const modified = list.map((s) => {
          if (s.id === sesionId) {
            updated = { ...s, ...cambios };
            return updated;
          }
          return s;
        });
        return { ...map, [grupoId]: modified };
      });

      return of({
        idTransaccion: `mock-tx-update-ses-${sesionId}`,
        exitoso: true,
        mensajeUsuario: 'Horario y aula de la sesión actualizados exitosamente.',
        datos: updated as unknown as ClassSession,
      }).pipe(delay(250));
    }

    return this.http
      .put<ApiResponse<ClassSession>>(`${environment.apiUrl}/sesiones/${sesionId}`, cambios)
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-update-001',
          exitoso: res.exitoso,
          mensajeUsuario: res.mensajeUsuario || 'Sesión actualizada.',
          datos: res.datos,
        }))
      );
  }

  closeSession(sesionId: string): Observable<ApiResponse<void>> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/sesiones/cierres`, {
        sesion: sesionId,
      })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-cierre-001',
          exitoso: res.exitoso,
          mensajeUsuario: res.mensajeUsuario || 'Sesión cerrada y consolidada exitosamente.',
          datos: undefined,
        }))
      );
  }

  cancelarSesion(sesionId: string, motivo: string): Observable<ApiResponse<any>> {
    if (environment.useMocks) {
      this.sessionsByGroupSignal.update((current) => {
        const next: Record<string, ClassSession[]> = { ...current };
        for (const [courseId, list] of Object.entries(next)) {
          next[courseId] = list.map((s) =>
            s.id === sesionId
              ? { ...s, status: 'CONCLUIDA' as const, topic: `[CANCELADA] ${motivo} - ${s.topic}` }
              : s
          );
        }
        return next;
      });

      return of({
        idTransaccion: `mock-tx-cancelar-${sesionId}`,
        exitoso: true,
        mensajeUsuario: 'Sesión cancelada formalmente y notificada a los estudiantes.',
        datos: { sesionId, estado: 'CANCELADA', motivoCancelacion: motivo },
      }).pipe(delay(250));
    }

    return this.http
      .patch<any>(`${environment.apiUrl}/docente/sesiones/${sesionId}/cancelar`, { motivo })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-cancelar-ses',
          exitoso: true,
          mensajeUsuario: res.mensajeUsuario || 'Sesión cancelada formalmente.',
          datos: res.datos,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-cancelar-error',
            exitoso: false,
            mensajeUsuario: 'No fue posible cancelar la sesión.',
            datos: undefined,
          })
        )
      );
  }

  getQrToken(sesionId: string): Observable<ApiResponse<{
    sesionId: string;
    grupoId: string;
    token: string;
    codigoAcceso: string;
    expiraEnSegundos: number;
    expiraEn: string;
  }>> {
    return this.http.get<ApiResponse<{
      sesionId: string;
      grupoId: string;
      token: string;
      codigoAcceso: string;
      expiraEnSegundos: number;
      expiraEn: string;
    }>>(`${environment.apiUrl}/sesiones/${sesionId}/qr-token`).pipe(
      map((res) => ({
        idTransaccion: res.idTransaccion || 'tx-qr-token',
        exitoso: res.exitoso,
        mensajeUsuario: res.mensajeUsuario || 'Token generado con éxito.',
        datos: res.datos,
      }))
    );
  }

  registrarAutoAsistencia(payload: { token?: string; codigoAcceso?: string }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${environment.apiUrl}/estudiante/asistencia-qr`, payload).pipe(
      map((res) => ({
        idTransaccion: res.idTransaccion || 'tx-auto-asistencia',
        exitoso: res.exitoso,
        mensajeUsuario: res.mensajeUsuario || '¡Asistencia registrada con éxito!',
        datos: res.datos,
      })),
      catchError((err: unknown) => {
        const errAny = err as { error?: { message?: string; mensajeUsuario?: string } };
        const msg = errAny?.error?.message || errAny?.error?.mensajeUsuario || 'El código ingresado no es válido o ha expirado.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
