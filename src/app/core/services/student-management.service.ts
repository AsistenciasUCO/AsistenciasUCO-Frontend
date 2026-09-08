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

  getPrerrequisitosMateria(materiaId: string): Observable<ApiResponse<any[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-prerrequisitos',
        exitoso: true,
        total: 2,
        datos: [
          {
            id: 'req-01',
            materiaId,
            prerrequisitoCodigo: 'IS-302',
            prerrequisitoNombre: 'Ingeniería de Software I',
            creditos: 3,
            tipo: 'OBLIGATORIO',
            estadoAcademico: 'APROBADA',
          },
          {
            id: 'req-02',
            materiaId,
            prerrequisitoCodigo: 'BD-301',
            prerrequisitoNombre: 'Bases de Datos Avanzadas',
            creditos: 3,
            tipo: 'OBLIGATORIO',
            estadoAcademico: 'PENDIENTE',
          },
        ],
      }).pipe(delay(250));
    }

    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/estudiante/materias/${materiaId}/prerrequisitos`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-prerrequisitos',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar los prerrequisitos de la materia.',
          datos: [],
        })
      )
    );
  }

  matricularGrupo(codigoOPin: string): Observable<ApiResponse<any>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: `mock-tx-matricula-${Date.now()}`,
        exitoso: true,
        mensajeUsuario: '¡Te has matriculado exitosamente en el grupo!',
        datos: { grupoId: codigoOPin },
      }).pipe(delay(300));
    }

    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/estudiante/matricular-grupo`, {
      codigo: codigoOPin,
    });
  }
}

