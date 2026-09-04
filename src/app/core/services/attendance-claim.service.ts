import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  SesionMateriaDetalle,
  SolicitudRevisionItem,
  HorarioDocenteItem,
} from '../models/role-management.model';
import {
  MOCK_SESIONES_MATERIAS,
  MOCK_SOLICITUDES_REVISION,
  MOCK_HORARIOS_DOCENTE,
} from '../mocks/role-management.mock';
import { ClaimMapper, SolicitudRevisionDTO } from '../mappers/claim.mapper';
import { StorageSerializer } from '../utils/storage-serializer.util';

@Injectable({
  providedIn: 'root',
})
export class AttendanceClaimService {
  private readonly STORAGE_KEY = 'gestio_claims_db';

  private loadStoredClaims(): SolicitudRevisionItem[] {
    const cached = StorageSerializer.deserializeWithMapper<SolicitudRevisionDTO, SolicitudRevisionItem>(
      this.STORAGE_KEY,
      ClaimMapper.fromDTO,
      []
    );
    return cached.length > 0 ? cached : [...MOCK_SOLICITUDES_REVISION];
  }

  private persistClaims(list: SolicitudRevisionItem[]): void {
    StorageSerializer.serializeWithMapper<SolicitudRevisionDTO, SolicitudRevisionItem>(
      this.STORAGE_KEY,
      list,
      ClaimMapper.toDTO
    );
  }

  private solicitudes = signal<SolicitudRevisionItem[]>(this.loadStoredClaims());
  private sesionesPorMateria = signal<Record<string, SesionMateriaDetalle[]>>({
    ...MOCK_SESIONES_MATERIAS,
  });
  private horariosDocente = signal<HorarioDocenteItem[]>([...MOCK_HORARIOS_DOCENTE]);

  constructor(private http: HttpClient) {}

  getReclamosDocente(docenteId?: string): Observable<ApiResponse<SolicitudRevisionItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-claims-list',
        exitoso: true,
        total: this.solicitudes().length,
        datos: [...this.solicitudes()],
      }).pipe(delay(300));
    }

    return this.http
      .get<ApiResponse<SolicitudRevisionItem[]>>(`${environment.apiUrl}/docente/reclamos`)
      .pipe(
        catchError(() =>
          of({
            idTransaccion: 'error-claims',
            exitoso: false,
            mensajeUsuario: 'No fue posible cargar las solicitudes de revisión.',
            datos: [],
          })
        )
      );
  }

  getSesionesPorMateria(materiaId: string): Observable<ApiResponse<SesionMateriaDetalle[]>> {
    if (environment.useMocks) {
      const sesiones = this.sesionesPorMateria()[materiaId] || [];
      return of({
        idTransaccion: `mock-tx-sessions-${materiaId}`,
        exitoso: true,
        total: sesiones.length,
        datos: [...sesiones],
      }).pipe(delay(250));
    }

    return this.http
      .get<ApiResponse<SesionMateriaDetalle[]>>(`${environment.apiUrl}/estudiante/materias/${materiaId}/sesiones`)
      .pipe(
        catchError(() =>
          of({
            idTransaccion: 'error-sessions',
            exitoso: false,
            mensajeUsuario: 'No fue posible cargar el historial de sesiones.',
            datos: [],
          })
        )
      );
  }

  crearReclamo(
    solicitud: Omit<SolicitudRevisionItem, 'id' | 'fechaSolicitud' | 'estadoSolicitud'>
  ): Observable<ApiResponse<SolicitudRevisionItem>> {
    const id = `REC-${String(this.solicitudes().length + 1).padStart(3, '0')}`;
    const fechaSolicitud = new Date().toISOString().split('T')[0];
    const nuevaSolicitud: SolicitudRevisionItem = {
      ...solicitud,
      id,
      fechaSolicitud,
      estadoSolicitud: 'PENDIENTE',
    };

    if (environment.useMocks) {
      // 1. Agregar a la lista global de solicitudes
      this.solicitudes.update((prev) => {
        const next = [nuevaSolicitud, ...prev];
        this.persistClaims(next);
        return next;
      });

      // 2. Actualizar la sesión en el desglose de la materia
      this.sesionesPorMateria.update((map) => {
        const sesiones = map[solicitud.materiaId] || [];
        const actualizadas = sesiones.map((s) => {
          if (s.id === solicitud.sesionId) {
            return {
              ...s,
              reclamoId: id,
              estadoReclamo: 'PENDIENTE' as const,
              categoriaReclamo: solicitud.categoria,
              soporteAdjuntoNombre: solicitud.soporteAdjunto?.nombre,
              justificacionEstudiante: solicitud.justificacionSolicitud,
            };
          }
          return s;
        });
        return { ...map, [solicitud.materiaId]: actualizadas };
      });

      return of({
        idTransaccion: 'mock-tx-claim-created',
        exitoso: true,
        mensajeUsuario: 'Tu solicitud de revisión de asistencia ha sido radicada ante el docente.',
        datos: nuevaSolicitud,
      }).pipe(delay(350));
    }

    return this.http.post<ApiResponse<SolicitudRevisionItem>>(
      `${environment.apiUrl}/estudiante/reclamos`,
      solicitud
    );
  }

  eliminarReclamo(
    id: string,
    materiaId: string,
    sesionId: string
  ): Observable<ApiResponse<boolean>> {
    if (environment.useMocks) {
      this.solicitudes.update((prev) => {
        const next = prev.filter((item) => item.id !== id);
        this.persistClaims(next);
        return next;
      });

      this.sesionesPorMateria.update((map) => {
        const sesiones = map[materiaId] || [];
        const actualizadas = sesiones.map((s) => {
          if (s.id === sesionId) {
            return {
              ...s,
              reclamoId: undefined,
              estadoReclamo: undefined,
              categoriaReclamo: undefined,
              soporteAdjuntoNombre: undefined,
              justificacionEstudiante: undefined,
              respuestaDocente: undefined,
            };
          }
          return s;
        });
        return { ...map, [materiaId]: actualizadas };
      });

      return of({
        idTransaccion: 'mock-tx-claim-deleted',
        exitoso: true,
        mensajeUsuario: 'La solicitud de revisión ha sido eliminada correctamente.',
        datos: true,
      }).pipe(delay(300));
    }

    return this.http.delete<ApiResponse<boolean>>(
      `${environment.apiUrl}/estudiante/reclamos/${id}`
    );
  }

  resolverReclamo(
    id: string,
    accion: 'APROBADA' | 'RECHAZADA',
    respuestaDocente: string = ''
  ): Observable<ApiResponse<SolicitudRevisionItem | null>> {
    if (environment.useMocks) {
      let resolvedItem: SolicitudRevisionItem | null = null;
      const fechaRespuesta = new Date().toISOString().split('T')[0];

      this.solicitudes.update((prev) => {
        const next = prev.map((item) => {
          if (item.id === id) {
            resolvedItem = {
              ...item,
              estadoSolicitud: accion,
              justificacionRespuesta: respuestaDocente,
              fechaRespuesta,
            };
            return resolvedItem;
          }
          return item;
        });
        this.persistClaims(next);
        return next;
      });

      if (resolvedItem) {
        const item = resolvedItem as SolicitudRevisionItem;
        // Actualizar el estado de la sesión si fue aprobada
        this.sesionesPorMateria.update((map) => {
          const sesiones = map[item.materiaId] || [];
          const actualizadas = sesiones.map((s) => {
            if (s.id === item.sesionId) {
              return {
                ...s,
                estadoAsistencia: accion === 'APROBADA' ? ('JUSTIFICADA' as const) : s.estadoAsistencia,
                estadoReclamo: accion,
                respuestaDocente,
              };
            }
            return s;
          });
          return { ...map, [item.materiaId]: actualizadas };
        });

        const mensaje =
          accion === 'APROBADA'
            ? 'Reclamo aprobado. Se ha actualizado la asistencia a "Justificada".'
            : 'Reclamo rechazado con la justificación suministrada.';

        return of({
          idTransaccion: 'mock-tx-claim-resolved',
          exitoso: true,
          mensajeUsuario: mensaje,
          datos: resolvedItem,
        }).pipe(delay(300));
      }

      return of({
        idTransaccion: 'mock-tx-not-found',
        exitoso: false,
        mensajeUsuario: 'Solicitud no encontrada.',
        datos: null,
      });
    }

    return this.http.patch<ApiResponse<SolicitudRevisionItem | null>>(
      `${environment.apiUrl}/docente/reclamos/${id}`,
      { accion, respuesta: respuestaDocente }
    );
  }

  getHorarioDocente(docenteId?: string): Observable<ApiResponse<HorarioDocenteItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-teacher-schedule',
        exitoso: true,
        total: this.horariosDocente().length,
        datos: [...this.horariosDocente()],
      }).pipe(delay(300));
    }

    return this.http
      .get<ApiResponse<HorarioDocenteItem[]>>(`${environment.apiUrl}/docente/horarios`)
      .pipe(
        catchError(() =>
          of({
            idTransaccion: 'error-teacher-schedule',
            exitoso: false,
            mensajeUsuario: 'No fue posible cargar el horario del docente.',
            datos: [],
          })
        )
      );
  }
}
