import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiDataResponse } from '../api/models/api-data-response.model';
import { ClaimMapper, ReclamoDocenteApi } from '../mappers/claim.mapper';
import { SessionTimeZoneService } from './session-timezone.service';
import {
  SesionMateriaDetalle,
  SolicitudRevisionItem,
  HorarioDocenteItem,
} from '../models/role-management.model';

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
   */
  getReclamosDocente(docenteId?: string): Observable<ApiResponse<SolicitudRevisionItem[]>> {
    return this.http.get<ApiResponse<ReclamoDocenteApi[]>>(`${environment.apiUrl}/docente/reclamos`).pipe(
      map((res): ApiResponse<SolicitudRevisionItem[]> => ({
        ...res,
        datos: (res.datos ?? []).map((item) =>
          ClaimMapper.fromReclamoDocente(item, (instant) => this.sessionTimeZone.displayInstant(instant).date)
        ),
      })),
      catchError((error) => {
        if (error?.status === 501 || error?.status === 404) {
          return of({
            exitoso: true,
            mensajeUsuario: 'Módulo de reclamos no disponible en este entorno',
            datos: []
          });
        }
        return throwError(() => error);
      })
    );
  }

  getSesionesPorMateria(materiaId: string): Observable<ApiResponse<SesionMateriaDetalle[]>> {
    return this.http.get<ApiResponse<SesionMateriaDetalle[]>>(`${environment.apiUrl}/estudiante/materias/${materiaId}/sesiones`);
  }

  crearReclamo(
    solicitud: Omit<SolicitudRevisionItem, 'id' | 'fechaSolicitud' | 'estadoSolicitud'>
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
      payload
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
