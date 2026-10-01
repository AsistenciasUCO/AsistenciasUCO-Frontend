import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiListResponse } from '../api/models/api-list-response.model';
import { EstudianteGrupoApiDto } from '../api/models/estudiante-grupo-api-dto.model';
import { GrupoApiDto } from '../api/models/grupo-api-dto.model';
import { MOCK_ESTUDIANTES_DIRECTORIO } from '../mocks/role-management.mock';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private http: HttpClient) {}

  getAllGroups(): Observable<ApiListResponse<GrupoApiDto>> {
    return this.http.get<ApiListResponse<GrupoApiDto>>(`${environment.apiUrl}/grupos`);
  }

  getStudentsByGroup(
    grupoId: string
  ): Observable<ApiListResponse<EstudianteGrupoApiDto>> {
    if (environment.useMocks) {
      const students = MOCK_ESTUDIANTES_DIRECTORIO.filter((student) =>
        student.gruposInscritos?.includes(grupoId)
      ).map(
        (student): EstudianteGrupoApiDto => ({
          id: `matricula-${grupoId}-${student.id}`,
          idEstudiante: student.id,
          documento: student.documento,
          nombreCompleto: student.nombreCompleto,
          correo: student.correo,
          codigoEstado: student.estadoMatricula,
          nombreEstado: student.estadoMatricula,
        })
      );

      return of({ exitoso: true, datos: students, total: students.length }).pipe(
        delay(200)
      );
    }

    return this.http.get<ApiListResponse<EstudianteGrupoApiDto>>(
      `${environment.apiUrl}/grupos/${grupoId}/estudiantes`
    );
  }

  descargarPlanillaExcel(grupoId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/grupos/${grupoId}/reportes/asistencia-excel`, {
      responseType: 'blob',
    });
  }
}
