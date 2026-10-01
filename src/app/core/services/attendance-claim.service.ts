import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  SesionMateriaDetalle,
  SolicitudRevisionItem,
  HorarioDocenteItem,
} from '../models/role-management.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceClaimService {
  constructor(private http: HttpClient) {}

  subirSoporte(file: File): Observable<ApiResponse<{ nombre: string; nombreGuardado: string; url: string; tamanio: number }>> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post<ApiResponse<{ nombre: string; nombreGuardado: string; url: string; tamanio: number }>>(
      `${environment.apiUrl}/archivos/subir`,
      formData
    );
  }

  getReclamosDocente(docenteId?: string): Observable<ApiResponse<SolicitudRevisionItem[]>> {
    return this.http.get<ApiResponse<SolicitudRevisionItem[]>>(`${environment.apiUrl}/docente/reclamos`).pipe(
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
    const payload = {
      sesionId: solicitud.sesionId,
      categoria: solicitud.categoria,
      justificacion: solicitud.justificacionSolicitud,
      soporteNombre: solicitud.soporteAdjunto?.nombre,
      soporteUrl: solicitud.soporteAdjunto?.urlSimulada,
    };
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
  ): Observable<ApiResponse<SolicitudRevisionItem | null>> {
    return this.http.patch<ApiResponse<SolicitudRevisionItem | null>>(
      `${environment.apiUrl}/docente/reclamos/${id}`,
      { accion, respuestaDocente, respuesta: respuestaDocente }
    );
  }

  getHorarioDocente(docenteId?: string): Observable<ApiResponse<HorarioDocenteItem[]>> {
    return this.http.get<ApiResponse<HorarioDocenteItem[]>>(`${environment.apiUrl}/docente/horarios`);
  }
}
