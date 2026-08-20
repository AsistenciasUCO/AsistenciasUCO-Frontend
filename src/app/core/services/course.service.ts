import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Course } from '../models/course.model';
import { MOCK_COURSES } from '../mocks/course.mock';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getTeacherCourses(): Observable<ApiResponse<Course[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-courses-001',
        exitoso: true,
        total: MOCK_COURSES.length,
        datos: MOCK_COURSES,
      }).pipe(delay(400));
    }

    return this.http.get<any[]>(`${environment.apiUrl}/grupos`).pipe(
      map((grupos: any[]) => ({
        idTransaccion: 'tx-courses-001',
        exitoso: true,
        total: grupos ? grupos.length : 0,
        datos: grupos
          ? grupos.map((g, idx) => ({
              id: g.id,
              code: g.codigo || g.codigoGrupo || `GRP-00${idx + 1}`,
              name: g.nombreAsignatura || g.nombreMateria || g.nombre || 'Asignatura',
              section: g.nombre || g.seccion || 'Seccion A',
              schedule: g.horario || '',
              room: g.aula || '',
              enrolledStudentsCount: g.estudiantesActivos || g.totalEstudiantes || 0,
              docenteName: g.nombreDocente || '',
              colorCategory: (['emerald', 'amber', 'blue', 'purple'][idx % 4]) as any,
            }))
          : [],
      }))
    );
  }
}
