import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiListResponse } from '../api/models/api-list-response.model';
import { ApiMessageResponse } from '../api/models/api-message-response.model';
import { AsistenciaConsultadaApiDto } from '../api/models/asistencia-consultada-api-dto.model';
import { RegistrarAsistenciaRequest } from '../api/models/registrar-asistencia-request.model';
import { SolicitarRevisionAsistenciaRequest } from '../api/models/solicitar-revision-asistencia-request.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private http: HttpClient) {}

  getAttendancesByGroup(
    grupoId: string,
    sesionId?: string
  ): Observable<ApiListResponse<AsistenciaConsultadaApiDto>> {
    if (!environment.features.attendanceEnabled) {
      return throwError(
        () =>
          new Error(
            'Funcionalidad de asistencia temporalmente no disponible.'
          )
      );
    }

    return this.http.get<ApiListResponse<AsistenciaConsultadaApiDto>>(
      `${environment.apiUrl}/grupos/${grupoId}/asistencias`,
      {
        params: sesionId ? { sesionId } : {},
      }
    );
  }

  registerAttendance(
    request: RegistrarAsistenciaRequest
  ): Observable<ApiMessageResponse> {
    if (!environment.features.attendanceEnabled) {
      return throwError(
        () =>
          new Error(
            'Funcionalidad de asistencia temporalmente no disponible.'
          )
      );
    }

    return this.http.post<ApiMessageResponse>(
      `${environment.apiUrl}/asistencias`,
      request
    );
  }

  requestAttendanceRevision(
    request: SolicitarRevisionAsistenciaRequest
  ): Observable<ApiMessageResponse> {
    if (!environment.features.attendanceEnabled) {
      return throwError(
        () =>
          new Error(
            'Funcionalidad de asistencia temporalmente no disponible.'
          )
      );
    }

    const motivo = request.motivo.trim();

    if (motivo.length < 10 || motivo.length > 300) {
      return throwError(
        () => new Error('El motivo debe contener entre 10 y 300 caracteres.')
      );
    }

    return this.http.post<ApiMessageResponse>(
      `${environment.apiUrl}/asistencias/revisiones`,
      {
        asistencia: request.asistencia,
        motivo,
      }
    );
  }
}
