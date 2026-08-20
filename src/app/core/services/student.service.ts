import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface EnrollStudentDTO {
  grupo: string;
  estudiante?: string;
  tipoDocumento: string;
  numeroIdentificacion: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  telefono?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  enrollStudentInGroup(dto: EnrollStudentDTO): Observable<ApiResponse<void>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-enroll-001',
        exitoso: true,
        mensajeUsuario: 'Estudiante matriculado y vinculado al grupo exitosamente.',
        datos: undefined,
      }).pipe(delay(400));
    }

    const payload = {
      tipoIdentificacionId: dto.tipoDocumento,
      numeroIdentificacion: Number(dto.numeroIdentificacion),
      primerNombre: dto.primerNombre,
      segundoNombre: dto.segundoNombre || '',
      primerApellido: dto.primerApellido,
      segundoApellido: dto.segundoApellido || '',
      correo: dto.correoElectronico,
      password: dto.password || `Uco2026*${dto.numeroIdentificacion}`,
    };

    return this.http
      .post<any>(`${environment.apiUrl}/grupos/${dto.grupo}/estudiantes`, payload)
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-enroll-001',
          exitoso: true,
          mensajeUsuario: 'Estudiante matriculado y vinculado al grupo exitosamente.',
          datos: undefined,
        }))
      );
  }

  getStudentsByGroup(grupoId: string): Observable<ApiResponse<any[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-std-001',
        exitoso: true,
        total: 0,
        datos: [],
      }).pipe(delay(200));
    }

    return this.http
      .get<any>(`${environment.apiUrl}/estudiantes`, {
        params: grupoId ? { grupoId } : {},
      })
      .pipe(
        map((res: any) => {
          const items = res.elementos || res.items || (Array.isArray(res) ? res : []);
          const mapped = items.map((s: any, idx: number) => ({
            studentId: s.id || `std-${idx}`,
            studentName: s.nombreCompleto || `${s.primerNombre || s.nombre || ''} ${s.primerApellido || s.apellido || ''}`.trim() || 'Estudiante UCO',
            studentCode: s.numeroIdentificacion ? String(s.numeroIdentificacion) : `2026-${1000 + idx}`,
            status: 'AN' as const,
          }));

          return {
            idTransaccion: 'tx-std-001',
            exitoso: true,
            total: res.totalElementos || mapped.length,
            datos: mapped,
          };
        }),
        catchError(() =>
          of({
            idTransaccion: 'tx-std-fallback',
            exitoso: true,
            total: 0,
            datos: [],
          })
        )
      );
  }

  getStudentById(estudianteId: string): Observable<ApiResponse<any>> {
    return this.http.get<any>(`${environment.apiUrl}/estudiantes/${estudianteId}`).pipe(
      map((res) => ({
        idTransaccion: 'tx-std-id-001',
        exitoso: true,
        datos: res,
      })),
      catchError(() =>
        of({
          idTransaccion: 'tx-std-id-fallback',
          exitoso: true,
          datos: {
            id: estudianteId,
            nombreCompleto: 'Estudiante Registrado',
          },
        })
      )
    );
  }
}
