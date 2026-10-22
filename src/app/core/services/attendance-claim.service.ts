import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiDataResponse } from '../api/models/api-data-response.model';
import { ClaimMapper, DetalleReclamoDocenteApi, ReclamoDocenteApi } from '../mappers/claim.mapper';
import { StudentPortalMapper } from '../mappers/student-portal.mapper';
import { ApiListResponse } from '../api/models/api-list-response.model';
import { SesionMateriaEstudianteApiDto } from '../api/models/estudiante-portal-api-dto.model';
import { BYPASS_GLOBAL_ERROR_TOAST } from '../interceptors/error.interceptor';
import { isUuid } from '../utils/uuid.util';
import { SessionTimeZoneService } from './session-timezone.service';
import {
  DetalleReclamoDocenteItem,
  SesionMateriaDetalle,
  SolicitudRevisionItem,
  HorarioDocenteItem,
} from '../models/role-management.model';

/** Filtro de la bandeja del docente: `estado` P/A/R opcional; `pagina` base 1; `tamano` máximo 100 (límite del backend). */
export interface FiltroReclamosDocente {
  estado?: 'P' | 'A' | 'R';
  pagina: number;
  tamano: number;
}

/** El identificador (asignatura o solicitud) no es un UUID: no se emite ninguna peticion HTTP. */
export class IdentificadorInvalidoError extends Error {
  constructor(readonly valor: unknown) {
    super('Identificador inválido.');
    this.name = 'IdentificadorInvalidoError';
  }
}

export interface ResolverReclamoResponse {
  exitoso: boolean;
  idTransaccion?: string;
  mensajeUsuario?: string;
  mensajeTecnico?: string;
  /** El contrato de resolución es void; algunos despliegues omiten `datos`. */
  datos?: null;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceClaimService {
  private readonly sessionTimeZone = inject(SessionTimeZoneService);

  constructor(private http: HttpClient) {}

  subirSoporte(file: File): Observable<ApiDataResponse<{ fileId: string; nombre: string; url: string; tamanio: number }>> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post<ApiDataResponse<{ fileId: string; nombre: string; url: string; tamanio: number }>>(
      `${environment.apiUrl}/archivos/subir`,
      formData
    );
  }

  descargarSoporte(fileId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/archivos/${encodeURIComponent(fileId)}`, {
      responseType: 'blob',
    });
  }

  /**
   * Reclamos del docente titular. El backend (LB-004D) devuelve `ApiListResponse<ReclamoDocenteApi>` con instantes UTC;
   * se adaptan al modelo de UI presentando las fechas en la zona IANA seleccionada, sin perder el instante original.
   * La paginación y el filtro de estado los resuelve el servidor (`estado`, `pagina`, `tamano`); `total` es el total
   * del servidor. Los errores HTTP (404/501 incluidos) se propagan: jamás se simulan como lista vacía exitosa.
   */
  getReclamosDocente(filtro: FiltroReclamosDocente): Observable<ApiListResponse<SolicitudRevisionItem>>;
  /** Compatibilidad con consumidores del tablero que no paginan: primera página con el tamaño por defecto del backend. */
  getReclamosDocente(): Observable<ApiResponse<SolicitudRevisionItem[]>>;
  getReclamosDocente(filtro: FiltroReclamosDocente = { pagina: 1, tamano: 10 }): Observable<ApiListResponse<SolicitudRevisionItem>> {
    let params = new HttpParams().set('pagina', filtro.pagina).set('tamano', filtro.tamano);
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }
    return this.http.get<ApiListResponse<ReclamoDocenteApi>>(`${environment.apiUrl}/docente/reclamos`, { params }).pipe(
      map((res): ApiListResponse<SolicitudRevisionItem> => {
        const datos = (res.datos ?? []).map((item) =>
          ClaimMapper.fromReclamoDocente(item, (instant) => this.sessionTimeZone.displayInstant(instant).date)
        );
        return { ...res, datos, total: res.total ?? datos.length };
      })
    );
  }

  /**
   * Detalle de una solicitud del docente titular (HU036). Valida el UUID antes de construir la ruta (sin petición si
   * es inválido). El error HTTP se propaga con su `ApiErrorResponse`; la vista muestra el `message` del backend.
   */
  getDetalleReclamoDocente(id: string): Observable<ApiDataResponse<DetalleReclamoDocenteItem>> {
    if (!isUuid(id)) {
      return throwError(() => new IdentificadorInvalidoError(id));
    }
    return this.http
      .get<ApiDataResponse<DetalleReclamoDocenteApi>>(`${environment.apiUrl}/docente/reclamos/${id}`, {
        context: new HttpContext().set(BYPASS_GLOBAL_ERROR_TOAST, true),
      })
      .pipe(
        map((res): ApiDataResponse<DetalleReclamoDocenteItem> => ({
          ...res,
          datos: ClaimMapper.fromDetalleReclamoDocente(res.datos, (instant) => this.sessionTimeZone.displayInstant(instant).date),
        }))
      );
  }

  /**
   * Sesiones de una asignatura (`idAsignatura`) del estudiante autenticado. Valida el UUID antes de construir la
   * ruta (jamas `/materias/undefined/sesiones`) y adapta `SesionMateriaEstudianteDTO` al modelo de UI. El backend
   * devuelve las sesiones de todos los grupos del estudiante en esa asignatura: el consumidor filtra por `grupoId`.
   * El error HTTP se propaga sin toast global; la vista lo presenta localmente.
   */
  getSesionesPorMateria(materiaId: string): Observable<ApiResponse<SesionMateriaDetalle[]>> {
    if (!isUuid(materiaId)) {
      return throwError(() => new IdentificadorInvalidoError(materiaId));
    }
    return this.http
      .get<ApiListResponse<SesionMateriaEstudianteApiDto>>(
        `${environment.apiUrl}/estudiante/materias/${materiaId}/sesiones`,
        { context: new HttpContext().set(BYPASS_GLOBAL_ERROR_TOAST, true) }
      )
      .pipe(
        map((res) => {
          const datos = StudentPortalMapper.toSesiones(res.datos, materiaId, (instant) =>
            this.sessionTimeZone.displayInstant(instant)
          );
          return { exitoso: res.exitoso, datos, total: datos.length };
        })
      );
  }

  /**
   * Radica un reclamo. `intentoId` (UUID) identifica el intento logico de radicacion y viaja como `X-Correlation-Id`,
   * la correlacion que el SP v2 usa para tratar como exito idempotente el reintento de una radicacion con soporte ya
   * persistida. Un reintento tecnico debe reutilizarlo; una solicitud nueva usa otro (sin el, el interceptor genera uno
   * por peticion).
   */
  crearReclamo(
    solicitud: Omit<SolicitudRevisionItem, 'id' | 'fechaSolicitud' | 'estadoSolicitud'>,
    intentoId?: string
  ): Observable<ApiResponse<SolicitudRevisionItem>> {
    // El unico dato de soporte que viaja es el fileId opaco generado por el backend (nunca nombre ni URL).
    const payload: {
      sesionId: string;
      categoria?: string;
      justificacion: string;
      soporteArchivoId?: string;
    } = {
      sesionId: solicitud.sesionId,
      categoria: solicitud.categoria,
      justificacion: solicitud.justificacionSolicitud,
    };
    if (solicitud.soporteAdjunto?.fileId) {
      payload.soporteArchivoId = solicitud.soporteAdjunto.fileId;
    }
    return this.http.post<ApiResponse<SolicitudRevisionItem>>(
      `${environment.apiUrl}/asistencias/revisiones`,
      payload,
      intentoId ? { headers: { 'X-Correlation-Id': intentoId } } : undefined
    );
  }

  eliminarReclamo(
    id: string,
    materiaId: string,
    sesionId: string
  ): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${environment.apiUrl}/estudiante/reclamos/${id}`);
  }

  resolverReclamo(
    id: string,
    accion: 'APROBADA' | 'RECHAZADA',
    respuestaDocente: string = ''
  ): Observable<ResolverReclamoResponse> {
    return this.http.patch<ResolverReclamoResponse>(
      `${environment.apiUrl}/docente/reclamos/${id}`,
      { accion, respuestaDocente, respuesta: respuestaDocente }
    );
  }

  getHorarioDocente(docenteId?: string): Observable<ApiResponse<HorarioDocenteItem[]>> {
    return this.http.get<ApiResponse<HorarioDocenteItem[]>>(`${environment.apiUrl}/docente/horarios`);
  }
}
