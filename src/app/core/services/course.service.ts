import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiListResponse } from '../api/models/api-list-response.model';
import { HorarioDocenteApiDto } from '../api/models/horario-docente-api-dto.model';
import { Course } from '../models/course.model';
import { MOCK_COURSES } from '../mocks/course.mock';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private coursesSignal = signal<Course[]>([...MOCK_COURSES]);

  constructor(private http: HttpClient) {}

  getTeacherCourses(docenteId?: string): Observable<ApiResponse<Course[]>> {
    return this.getCurrentTeacherCourses().pipe(
      map((res) => ({
        idTransaccion: 'tx-courses-teacher',
        exitoso: res.exitoso,
        total: res.total,
        datos: res.datos,
      }))
    );
  }

  getCurrentTeacherCourses(): Observable<ApiListResponse<Course>> {
    if (environment.useMocks) {
      const courses = [...this.coursesSignal()];
      return of({
        exitoso: true,
        total: courses.length,
        datos: courses,
      }).pipe(delay(250));
    }

    return this.http
      .get<ApiListResponse<HorarioDocenteApiDto>>(
        `${environment.apiUrl}/docente/horarios`
      )
      .pipe(
        map((response) => {
          const grouped = new Map<
            string,
            { horario: HorarioDocenteApiDto; scheduleBlocks: Set<string> }
          >();

          for (const horario of response.datos) {
            const scheduleBlock = `${horario.dia} ${horario.horaInicio.slice(
              0,
              5
            )}-${horario.horaFin.slice(0, 5)}`;
            const existing = grouped.get(horario.idGrupo);

            if (existing) {
              existing.scheduleBlocks.add(scheduleBlock);
            } else {
              grouped.set(horario.idGrupo, {
                horario,
                scheduleBlocks: new Set([scheduleBlock]),
              });
            }
          }

          const colors: Course['colorCategory'][] = [
            'emerald',
            'amber',
            'blue',
            'purple',
          ];
          const courses = Array.from(grouped.values()).map(
            ({ horario, scheduleBlocks }, index): Course => ({
              id: horario.idGrupo,
              code: horario.codigoMateria,
              name: horario.nombreMateria,
              section: horario.seccion,
              schedule: Array.from(scheduleBlocks).join(', '),
              room: horario.aula,
              enrolledStudentsCount: horario.totalEstudiantes,
              docenteName: 'Docente UCO',
              docenteId: horario.idDocente,
              colorCategory: colors[index % colors.length],
            })
          );

          return {
            exitoso: response.exitoso,
            total: courses.length,
            datos: courses,
          };
        })
      );
  }

  crearGrupo(nuevo: Partial<Course> & Record<string, unknown>): Observable<ApiResponse<Course>> {
    if (environment.useMocks) {
      const cursoCreado: Course = {
        id: `mock-crs-${this.coursesSignal().length + 1}`,
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

      this.coursesSignal.update((prev) => [cursoCreado, ...prev]);
      return of({
        idTransaccion: 'mock-tx-create-course',
        exitoso: true,
        mensajeUsuario: `Grupo ${cursoCreado.section} de ${cursoCreado.name} creado exitosamente.`,
        datos: cursoCreado,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<Course>>(`${environment.apiUrl}/grupos`, {
      code: nuevo.code,
      name: nuevo.name,
      section: nuevo.section,
      cupoMaximo: nuevo.cupoMaximo || 35,
      docenteName: nuevo.docenteName,
      colorCategory: nuevo.colorCategory,
      room: nuevo.room,
      schedule: nuevo.schedule,
      asignaturaId: nuevo['asignaturaId'],
      dias: nuevo['dias'],
      horaInicio: nuevo['horaInicio'],
      horaFin: nuevo['horaFin'],
      generarSesionesAutomaticas: nuevo['generarSesionesAutomaticas'],
    });
  }

  getAsignaturasDocente(): Observable<ApiResponse<unknown[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-asig-docente',
        exitoso: true,
        total: 2,
        datos: [
          { id: 'E2F3A4B5-0000-0000-0000-000000000001', codigo: 'ARQ-402', nombre: 'Arquitectura de Software', creditos: 3, nombrePrograma: 'Ingeniería de Sistemas' },
          { id: '12E18E5A-6AE2-43BD-8A99-5CC694D801C3', codigo: 'IS-302', nombre: 'Ingeniería de Software I', creditos: 4, nombrePrograma: 'Ingeniería de Sistemas' },
        ],
      }).pipe(delay(150));
    }

    return this.http.get<ApiResponse<unknown[]>>(`${environment.apiUrl}/docente/asignaturas`).pipe(
      map((res) => ({
        idTransaccion: res.idTransaccion || 'tx-docente-asig',
        exitoso: res.exitoso ?? true,
        total: res.total || (res.datos ? res.datos.length : 0),
        datos: res.datos || [],
      }))
    );
  }

  actualizarGrupo(id: string, cambios: Partial<Course>): Observable<ApiResponse<Course>> {
    if (environment.useMocks) {
      let actualizado: Course | null = null;
      this.coursesSignal.update((prev) => {
        return prev.map((c) => {
          if (c.id === id) {
            actualizado = { ...c, ...cambios };
            return actualizado;
          }
          return c;
        });
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
