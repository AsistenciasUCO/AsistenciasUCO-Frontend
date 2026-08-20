import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ClassSession } from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private http: HttpClient) {}

  getSessionsByGroup(grupoId: string): Observable<ApiResponse<ClassSession[]>> {
    return this.http
      .post<any>(`${environment.apiUrl}/sesiones/consultas`, {
        sesion: grupoId,
      })
      .pipe(
        map((res: any) => {
          const raw = res.datos || res.elementos || (Array.isArray(res) ? res : []);
          const list = Array.isArray(raw) ? raw : [raw];
          const validSessions = list.filter((s: any) => s && (s.id || s.sesion));
          const mapped: ClassSession[] = validSessions.map((s: any, idx: number) => ({
            id: s.id || s.sesion,
            courseId: s.grupo || grupoId,
            sessionNumber: s.numero || idx + 1,
            date: s.fechaHoraInicio ? s.fechaHoraInicio.split('T')[0] : '',
            startTime: s.fechaHoraInicio ? s.fechaHoraInicio.split('T')[1]?.substring(0, 5) : '',
            endTime: s.fechaHoraFin ? s.fechaHoraFin.split('T')[1]?.substring(0, 5) : '',
            title: s.nombre || '',
            topic: s.descripcion || s.nombre || '',
            status: s.cerrada ? 'CONCLUIDA' : 'PROGRAMADA',
            records: [],
          }));

          return {
            idTransaccion: 'tx-ses-001',
            exitoso: true,
            total: mapped.length,
            datos: mapped,
          };
        })
      );
  }

  createSession(grupoId: string, nombre: string, numero: number, fechaHoraInicio: string, fechaHoraFin: string): Observable<ApiResponse<void>> {
    return this.http
      .post<any>(`${environment.apiUrl}/sesiones`, {
        grupo: grupoId,
        nombre,
        numero,
        fechaHoraInicio,
        fechaHoraFin,
      })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-crear-001',
          exitoso: true,
          mensajeUsuario: 'Sesion de clase creada correctamente.',
          datos: undefined,
        }))
      );
  }

  closeSession(sesionId: string): Observable<ApiResponse<void>> {
    return this.http
      .post<any>(`${environment.apiUrl}/sesiones/cierres`, {
        sesion: sesionId,
      })
      .pipe(
        map((res) => ({
          idTransaccion: res.idTransaccion || 'tx-ses-cierre-001',
          exitoso: true,
          mensajeUsuario: 'Sesion cerrada y consolidada exitosamente.',
          datos: undefined,
        }))
      );
  }
}
