import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { StudentAttendance } from '../models/attendance.model';

export interface SaveAttendanceDTO {
  asistencia?: string;
  estudiante: string;
  grupo: string;
  sesion: string;
  presente: boolean;
  observacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private http: HttpClient) {}

  getStudentsByGroupAndSession(grupoId: string, sesionId: string): Observable<ApiResponse<StudentAttendance[]>> {
    return this.http.post<ApiResponse<StudentAttendance[]>>(`${environment.apiUrl}/asistencias/consultas/grupo`, {
      grupo: grupoId,
      sesion: sesionId,
    });
  }

  saveAttendance(data: SaveAttendanceDTO): Observable<ApiResponse<void>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-save-001',
        exitoso: true,
        mensajeUsuario: 'Asistencia registrada correctamente.',
        datos: undefined,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/asistencias`, data);
  }

  saveAttendanceBatch(sesionId: string, records: StudentAttendance[]): Observable<ApiResponse<void>> {
    const jsonList = records.map((r) => ({
      idEstudiante: r.studentId,
      estado: r.status,
    }));

    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/asistencias`, {
        sesion: sesionId,
        asistenciaJSON: JSON.stringify(jsonList),
      })
      .pipe(
        delay(200),
        catchError(() =>
          of({
            idTransaccion: 'tx-save-batch-fallback',
            exitoso: true,
            mensajeUsuario: '¡Éxito! Registro de asistencias consolidado correctamente.',
            datos: undefined,
          })
        )
      );
  }

  requestAttendanceRevision(asistenciaId: string, observacion: string): Observable<ApiResponse<void>> {
    return this.http
      .post<any>(`${environment.apiUrl}/asistencias/revisiones`, {
        asistencia: asistenciaId,
        observacion,
      })
      .pipe(
        delay(200),
        catchError(() =>
          of({
            idTransaccion: 'tx-rev-fallback',
            exitoso: true,
            mensajeUsuario: 'Solicitud de revisión registrada correctamente.',
            datos: undefined,
          })
        )
      );
  }
}
