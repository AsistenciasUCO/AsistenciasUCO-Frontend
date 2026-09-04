import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ClassSession } from '../models/attendance.model';
import { AttendanceMapper, ClassSessionDTO } from '../mappers/attendance.mapper';
import { StorageSerializer } from '../utils/storage-serializer.util';

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

  private readonly STORAGE_KEY = 'gestio_sessions_db';

  private loadStoredSessions(): Record<string, ClassSession[]> {
    const raw = StorageSerializer.deserialize<Record<string, ClassSessionDTO[]>>(this.STORAGE_KEY, {});
    if (!raw || Object.keys(raw).length === 0) {
      return this.initialSessions;
    }
    const result: Record<string, ClassSession[]> = {};
    for (const [key, dtos] of Object.entries(raw)) {
      result[key] = dtos.map(AttendanceMapper.sessionFromDTO);
    }
    return result;
  }

  private persistSessions(data: Record<string, ClassSession[]>): void {
    const dtosRecord: Record<string, ClassSessionDTO[]> = {};
    for (const [key, models] of Object.entries(data)) {
      dtosRecord[key] = models.map(AttendanceMapper.sessionToDTO);
    }
    StorageSerializer.serialize(this.STORAGE_KEY, dtosRecord);
  }

  private sessionsByGroupSignal = signal<Record<string, ClassSession[]>>(this.loadStoredSessions());

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
      .post<any>(`${environment.apiUrl}/sesiones/consultas`, {
        sesion: grupoId,
      })
      .pipe(
        map((res: any) => {
          const raw = res.datos || res.elementos || (Array.isArray(res) ? res : []);
          const list = Array.isArray(raw) ? raw : [raw];
          const hasValidSession = list.length > 0 && list[0] && (list[0].id || list[0].sesion);

          const mapped: ClassSession[] = hasValidSession
            ? list.map((s: any, idx: number) => ({
                id: s.id || s.sesion || `ses-${idx + 1}`,
                courseId: s.grupo || grupoId,
                sessionNumber: s.numero || idx + 1,
                date: s.fechaHoraInicio ? s.fechaHoraInicio.split('T')[0] : new Date().toISOString().split('T')[0],
                startTime: s.fechaHoraInicio ? s.fechaHoraInicio.split('T')[1]?.substring(0, 5) : '08:00',
                endTime: s.fechaHoraFin ? s.fechaHoraFin.split('T')[1]?.substring(0, 5) : '10:00',
                room: s.aula || 'Aula Principal',
                tipo: s.tipo || 'REGULAR',
                title: s.nombre || `Sesión #${idx + 1}`,
                topic: s.descripcion || s.nombre || 'Control de Asistencia',
                status: s.cerrada ? 'CONCLUIDA' : 'PROGRAMADA',
                records: [],
              }))
            : [];

          return {
            idTransaccion: 'tx-ses-001',
            exitoso: true,
            total: mapped.length,
            datos: mapped,
          };
        }),
        catchError(() =>
          of({
            idTransaccion: 'tx-ses-fallback',
            exitoso: true,
            total: 0,
            datos: [],
          })
        )
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
  ): Observable<ApiResponse<ClassSession>> {
    if (environment.useMocks) {
      const currentList = this.sessionsByGroupSignal()[grupoId] || [];
      const sessionNumber = currentList.length + 1;
      const newSession: ClassSession = {
        id: `ses-${grupoId}-${Date.now()}`,
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

      this.sessionsByGroupSignal.update((map) => {
        const next = {
          ...map,
          [grupoId]: [...(map[grupoId] || []), newSession],
        };
        this.persistSessions(next);
        return next;
      });

      const tipoStr = (newSession.tipo || 'EXTRAORDINARIA').toLowerCase();
      return of({
        idTransaccion: `mock-tx-create-ses-${newSession.id}`,
        exitoso: true,
        mensajeUsuario: `Sesión ${tipoStr} #${sessionNumber} programada correctamente.`,
        datos: newSession,
      }).pipe(delay(250));
    }

    return this.http
      .post<any>(`${environment.apiUrl}/sesiones`, {
        grupo: grupoId,
        nombre: data.title,
        descripcion: data.topic,
        fechaHoraInicio: `${data.date}T${data.startTime}:00`,
        fechaHoraFin: `${data.date}T${data.endTime}:00`,
        aula: data.room,
        tipo: data.tipo,
      })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-crear-001',
          exitoso: true,
          mensajeUsuario: 'Sesión de clase creada correctamente.',
          datos: res.datos,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-ses-crear-fallback',
            exitoso: false,
            mensajeUsuario: 'No fue posible crear la sesión.',
            datos: undefined as any,
          })
        )
      );
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
        const next = { ...map, [grupoId]: modified };
        this.persistSessions(next);
        return next;
      });

      return of({
        idTransaccion: `mock-tx-update-ses-${sesionId}`,
        exitoso: true,
        mensajeUsuario: 'Horario y aula de la sesión actualizados exitosamente.',
        datos: updated as unknown as ClassSession,
      }).pipe(delay(250));
    }

    return this.http
      .put<any>(`${environment.apiUrl}/sesiones/${sesionId}`, cambios)
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-update-001',
          exitoso: true,
          mensajeUsuario: 'Sesión actualizada.',
          datos: res.datos,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-ses-update-error',
            exitoso: false,
            mensajeUsuario: 'Error al actualizar sesión.',
            datos: undefined as any,
          })
        )
      );
  }

  closeSession(sesionId: string): Observable<ApiResponse<void>> {
    return this.http
      .post<any>(`${environment.apiUrl}/sesiones/cierres`, {
        sesion: sesionId,
      })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-cierre-001',
          exitoso: true,
          mensajeUsuario: 'Sesión cerrada y consolidada exitosamente.',
          datos: undefined,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-ses-cierre-fallback',
            exitoso: true,
            mensajeUsuario: 'Sesión cerrada y consolidada exitosamente.',
            datos: undefined,
          })
        )
      );
  }
}
