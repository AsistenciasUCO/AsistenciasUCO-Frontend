import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HorarioItem, MateriaEstudianteItem } from '../models/role-management.model';
import { MOCK_HORARIOS_ESTUDIANTE, MOCK_MATERIAS_ESTUDIANTE } from '../mocks/role-management.mock';

@Injectable({
  providedIn: 'root',
})
export class StudentManagementService {
  private horarios: HorarioItem[] = [...MOCK_HORARIOS_ESTUDIANTE];
  private materias: MateriaEstudianteItem[] = [...MOCK_MATERIAS_ESTUDIANTE];

  constructor(private http: HttpClient) {}

  getHorarios(): Observable<ApiResponse<HorarioItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-horarios',
        exitoso: true,
        total: this.horarios.length,
        datos: [...this.horarios],
      }).pipe(delay(300));
    }

    return this.http.get<ApiResponse<HorarioItem[]>>(`${environment.apiUrl}/estudiante/horarios`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-horarios',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar el horario del estudiante.',
          datos: [],
        })
      )
    );
  }

  getMaterias(): Observable<ApiResponse<MateriaEstudianteItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-materias',
        exitoso: true,
        total: this.materias.length,
        datos: [...this.materias],
      }).pipe(delay(350));
    }

    return this.http.get<ApiResponse<MateriaEstudianteItem[]>>(`${environment.apiUrl}/estudiante/materias`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-materias',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar las materias inscritas.',
          datos: [],
        })
      )
    );
  }
}
