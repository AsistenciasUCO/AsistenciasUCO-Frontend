import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Course } from '../models/course.model';
import { MOCK_COURSES } from '../mocks/course.mock';
import { CourseMapper, CourseDTO } from '../mappers/course.mapper';
import { StorageSerializer } from '../utils/storage-serializer.util';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly STORAGE_KEY = 'gestio_courses_db';

  private loadStoredCourses(): Course[] {
    const cached = StorageSerializer.deserializeWithMapper<CourseDTO, Course>(
      this.STORAGE_KEY,
      CourseMapper.fromDTO,
      []
    );
    return cached.length > 0 ? cached : [...MOCK_COURSES];
  }

  private persistCourses(courses: Course[]): void {
    StorageSerializer.serializeWithMapper<CourseDTO, Course>(
      this.STORAGE_KEY,
      courses,
      CourseMapper.toDTO
    );
  }

  private coursesSignal = signal<Course[]>(this.loadStoredCourses());

  constructor(private http: HttpClient) {}

  getTeacherCourses(docenteId?: string): Observable<ApiResponse<Course[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-courses-001',
        exitoso: true,
        total: this.coursesSignal().length,
        datos: [...this.coursesSignal()],
      }).pipe(delay(250));
    }

    return this.http.get<any[]>(`${environment.apiUrl}/grupos`).pipe(
      map((grupos: any[]) => ({
        idTransaccion: 'tx-courses-001',
        exitoso: true,
        total: grupos ? grupos.length : 0,
        datos: grupos ? grupos.map((g, idx) => ({
          id: g.id,
          code: g.codigo || g.codigoGrupo || `GRP-00${idx + 1}`,
          name: g.nombreAsignatura || g.nombreMateria || g.nombre || 'Asignatura',
          section: g.nombre || g.seccion || 'Sección A',
          schedule: g.horario || 'Lun, Mié 08:00 - 10:00 AM',
          room: g.aula || 'Aula Principal',
          enrolledStudentsCount: g.estudiantesActivos || g.totalEstudiantes || 0,
          cupoMaximo: g.cupoMaximo || 35,
          docenteName: g.nombreDocente || 'Docente UCO',
          colorCategory: (['emerald', 'amber', 'blue', 'purple'][idx % 4]) as any,
        })) : []
      })),
      catchError(() =>
        of({
          idTransaccion: 'tx-courses-error',
          exitoso: true,
          total: 0,
          datos: [],
        })
      )
    );
  }

  crearGrupo(nuevo: Partial<Course>): Observable<ApiResponse<Course>> {
    const id = `crs-${Date.now()}`;
    const cursoCreado: Course = {
      id,
      code: nuevo.code || 'ASIG-001',
      name: nuevo.name || 'Nueva Asignatura',
      section: nuevo.section || 'Grupo 01',
      schedule: nuevo.schedule || 'Lun, Mié 08:00 - 10:00 AM',
      room: nuevo.room || 'Aula Por Asignar',
      enrolledStudentsCount: nuevo.enrolledStudentsCount || 0,
      cupoMaximo: nuevo.cupoMaximo || 35,
      docenteName: nuevo.docenteName || 'Docente Titular',
      colorCategory: nuevo.colorCategory || 'emerald',
    };

    if (environment.useMocks) {
      this.coursesSignal.update((prev) => {
        const next = [cursoCreado, ...prev];
        this.persistCourses(next);
        return next;
      });
      return of({
        idTransaccion: `mock-tx-create-course-${id}`,
        exitoso: true,
        mensajeUsuario: `Grupo ${cursoCreado.section} de ${cursoCreado.name} creado exitosamente.`,
        datos: cursoCreado,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<Course>>(`${environment.apiUrl}/grupos`, cursoCreado);
  }

  actualizarGrupo(id: string, cambios: Partial<Course>): Observable<ApiResponse<Course>> {
    if (environment.useMocks) {
      let actualizado: Course | null = null;
      this.coursesSignal.update((prev) => {
        const next = prev.map((c) => {
          if (c.id === id) {
            actualizado = { ...c, ...cambios };
            return actualizado;
          }
          return c;
        });
        this.persistCourses(next);
        return next;
      });

      return of({
        idTransaccion: `mock-tx-update-course-${id}`,
        exitoso: true,
        mensajeUsuario: 'Información del grupo actualizada correctamente.',
        datos: actualizado as unknown as Course,
      }).pipe(delay(250));
    }

    return this.http.put<ApiResponse<Course>>(`${environment.apiUrl}/grupos/${id}`, cambios);
  }
}
