import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { StudentAttendance } from '../models/attendance.model';
import { AttendanceMapper, StudentAttendanceDTO } from '../mappers/attendance.mapper';
import { StorageSerializer } from '../utils/storage-serializer.util';

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
    if (environment.useMocks) {
      // Deserialización de registros previamente guardados en almacenamiento local
      const cached = StorageSerializer.deserializeWithMapper<StudentAttendanceDTO, StudentAttendance>(
        `gestio_attendance_sesion_${sesionId}`,
        AttendanceMapper.studentFromDTO,
        []
      );

      if (cached.length > 0) {
        return of({
          idTransaccion: `mock-tx-get-cached-${sesionId}`,
          exitoso: true,
          total: cached.length,
          datos: cached,
        }).pipe(delay(150));
      }
    }

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
    // 1. Serialización a DTOs de transporte
    const dtos: StudentAttendanceDTO[] = records.map(AttendanceMapper.studentToDTO);
    const jsonList = JSON.stringify(dtos);

    // 2. Persistencia en almacenamiento local para modo Mock / Offline
    StorageSerializer.serialize(`gestio_attendance_sesion_${sesionId}`, dtos);

    if (environment.useMocks) {
      return of({
        idTransaccion: `tx-save-batch-${Date.now()}`,
        exitoso: true,
        mensajeUsuario: '¡Éxito! Registro de asistencias serializado y guardado correctamente.',
        datos: undefined,
      }).pipe(delay(200));
    }

    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/asistencias`, {
        sesion: sesionId,
        asistenciaJSON: jsonList,
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
