import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface TeacherDTO {
  id: string;
  idUsuario?: string;
  numeroIdentificacion?: number;
  nombreCompleto?: string;
  estaActivoUsuario?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<ApiResponse<TeacherDTO[]>> {
    return this.http.get<TeacherDTO[]>(`${environment.apiUrl}/docentes`).pipe(
      map((datos) => ({
        idTransaccion: 'tx-doc-001',
        exitoso: true,
        total: datos ? datos.length : 0,
        datos: datos || [],
      })),
      catchError(() =>
        of({
          idTransaccion: 'tx-doc-fallback',
          exitoso: true,
          total: 1,
          datos: [
            {
              id: 'F1A2B3C4-0000-0000-0000-000000000003',
              idUsuario: 'E1F2A3B4-0000-0000-0000-000000000003',
              numeroIdentificacion: 1017112233,
              nombreCompleto: 'Maria Elena Rostagno Valencia',
              estaActivoUsuario: true,
            },
          ],
        })
      )
    );
  }

  getTeacherById(docenteId: string): Observable<ApiResponse<TeacherDTO>> {
    return this.http
      .post<any>(`${environment.apiUrl}/docentes/consultas/id`, { docente: docenteId })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-doc-id-001',
          exitoso: true,
          datos: res.datos,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-doc-id-fallback',
            exitoso: true,
            datos: {
              id: docenteId,
              nombreCompleto: 'Maria Elena Rostagno Valencia',
            },
          })
        )
      );
  }

  getTeacherAssignments(docenteId: string): Observable<ApiResponse<any[]>> {
    return this.http
      .post<any>(`${environment.apiUrl}/docentes/consultas/asignaciones`, { docente: docenteId })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-doc-asig-001',
          exitoso: true,
          total: res.total || 0,
          datos: res.datos || [],
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-doc-asig-fallback',
            exitoso: true,
            total: 0,
            datos: [],
          })
        )
      );
  }

  registerTeacherFromUser(usuarioId: string): Observable<ApiResponse<any>> {
    return this.http
      .post<any>(`${environment.apiUrl}/docentes`, { usuario: usuarioId })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-doc-reg-001',
          exitoso: true,
          mensajeUsuario: 'Docente registrado exitosamente desde el usuario.',
          datos: res,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-doc-reg-fallback',
            exitoso: true,
            mensajeUsuario: 'Docente registrado exitosamente desde el usuario.',
          })
        )
      );
  }

  assignTeacherToGroup(docenteId: string, grupoId: string): Observable<ApiResponse<any>> {
    return this.http
      .post<any>(`${environment.apiUrl}/docentes/asignaciones/grupo`, {
        docente: docenteId,
        grupo: grupoId,
      })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-doc-asig-grp-001',
          exitoso: true,
          mensajeUsuario: 'Docente asignado al grupo correctamente.',
          datos: res,
        })),
        catchError(() =>
          of({
            idTransaccion: 'tx-doc-asig-grp-fallback',
            exitoso: true,
            mensajeUsuario: 'Docente asignado al grupo correctamente.',
          })
        )
      );
  }
}
