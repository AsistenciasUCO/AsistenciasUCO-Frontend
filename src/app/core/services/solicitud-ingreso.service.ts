import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiListResponse } from '../api/models/api-list-response.model';
import { ApiDataResponse } from '../api/models/api-data-response.model';
import { BYPASS_GLOBAL_ERROR_TOAST } from '../interceptors/error.interceptor';

/** Estados de una solicitud de ingreso a grupo (HU053-HU055). */
export type EstadoSolicitudIngreso = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'EN_ESPERA' | 'RETIRADA';

/** `datos` de GET /estudiante/solicitudes-matricula. */
export interface SolicitudIngresoEstudiante {
  id: string;
  grupoId: string;
  grupoCodigo: number | null;
  grupoNombre: string;
  asignaturaId: string;
  asignaturaNombre: string;
  docenteNombre: string;
  estado: EstadoSolicitudIngreso;
  fechaSolicitudUtc: string | null;
  fechaResolucionUtc: string | null;
  motivoRechazo: string | null;
}

/** `datos` de GET /docente/grupos/{grupoId}/solicitudes-ingreso. */
export interface SolicitudIngresoDocente {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  numeroIdentificacion: number | null;
  estado: EstadoSolicitudIngreso;
  fechaSolicitudUtc: string | null;
  fechaResolucionUtc: string | null;
  motivoRechazo: string | null;
  posicionEspera: number | null;
  capacidadGrupo: number;
  cuposDisponibles: number;
}

export interface FiltroSolicitudesIngreso {
  estado?: EstadoSolicitudIngreso;
  pagina: number;
  tamano: number;
}

export interface ResultadoSolicitudIngreso {
  id: string;
  estadoResultante: 'ACEPTADA' | 'EN_ESPERA' | 'RECHAZADA';
}

/**
 * HU053-HU055: solicitudes de ingreso a un grupo. El estudiante solicita, consulta y retira las suyas; el docente
 * titular las consulta por grupo y las acepta (con cupo matricula, sin cupo quedan en espera) o rechaza con motivo.
 * Los errores HTTP se propagan sin toast global: cada pantalla presenta el mensaje del backend.
 */
@Injectable({ providedIn: 'root' })
export class SolicitudIngresoService {
  private readonly http = inject(HttpClient);
  private readonly sinToastGlobal = () => new HttpContext().set(BYPASS_GLOBAL_ERROR_TOAST, true);

  solicitar(grupoId: string): Observable<ApiDataResponse<{ id: string }>> {
    return this.http.post<ApiDataResponse<{ id: string }>>(
      `${environment.apiUrl}/estudiante/solicitudes-matricula`,
      { grupoId },
      { context: this.sinToastGlobal() }
    );
  }

  misSolicitudes(filtro: FiltroSolicitudesIngreso): Observable<ApiListResponse<SolicitudIngresoEstudiante>> {
    return this.http.get<ApiListResponse<SolicitudIngresoEstudiante>>(`${environment.apiUrl}/estudiante/solicitudes-matricula`, {
      params: this.params(filtro),
      context: this.sinToastGlobal(),
    });
  }

  retirar(id: string): Observable<ApiDataResponse<null>> {
    return this.http.post<ApiDataResponse<null>>(
      `${environment.apiUrl}/estudiante/solicitudes-matricula/${encodeURIComponent(id)}/retiro`,
      {},
      { context: this.sinToastGlobal() }
    );
  }

  solicitudesGrupo(grupoId: string, filtro: FiltroSolicitudesIngreso): Observable<ApiListResponse<SolicitudIngresoDocente>> {
    return this.http.get<ApiListResponse<SolicitudIngresoDocente>>(
      `${environment.apiUrl}/docente/grupos/${encodeURIComponent(grupoId)}/solicitudes-ingreso`,
      { params: this.params(filtro), context: this.sinToastGlobal() }
    );
  }

  resolver(id: string, accion: 'ACEPTAR' | 'RECHAZAR', motivo?: string): Observable<ApiDataResponse<ResultadoSolicitudIngreso>> {
    const cuerpo: { accion: string; motivo?: string } = { accion };
    if (accion === 'RECHAZAR') {
      cuerpo.motivo = motivo;
    }
    return this.http.patch<ApiDataResponse<ResultadoSolicitudIngreso>>(
      `${environment.apiUrl}/docente/solicitudes-ingreso/${encodeURIComponent(id)}`,
      cuerpo,
      { context: this.sinToastGlobal() }
    );
  }

  private params(filtro: FiltroSolicitudesIngreso): HttpParams {
    let params = new HttpParams().set('pagina', filtro.pagina).set('tamano', filtro.tamano);
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }
    return params;
  }
}
