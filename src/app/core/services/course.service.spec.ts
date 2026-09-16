import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CourseService } from './course.service';
import { environment } from '../../../environments/environment';
import { Course } from '../models/course.model';

describe('CourseService', () => {
  let service: CourseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CourseService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CourseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta /docente/horarios y deduplica por idGrupo', () => {
    let courses: Course[] = [];
    service
      .getCurrentTeacherCourses()
      .subscribe((response) => (courses = response.datos));

    const request = http.expectOne(`${environment.apiUrl}/docente/horarios`);
    expect(request.request.method).toBe('GET');
    request.flush({
      exitoso: true,
      total: 2,
      datos: [
        {
          id: 'h1',
          idDocente: 'd1',
          idGrupo: 'g1',
          codigoMateria: 'IS-001',
          nombreMateria: 'Arquitectura',
          seccion: 'Grupo 1',
          dia: 'Lunes',
          horaInicio: '08:00:00',
          horaFin: '10:00:00',
          aula: 'A101',
          totalEstudiantes: 25,
        },
        {
          id: 'h2',
          idDocente: 'd1',
          idGrupo: 'g1',
          codigoMateria: 'IS-001',
          nombreMateria: 'Arquitectura',
          seccion: 'Grupo 1',
          dia: 'Miércoles',
          horaInicio: '08:00:00',
          horaFin: '10:00:00',
          aula: 'A101',
          totalEstudiantes: 25,
        },
      ],
    });

    expect(courses.length).toBe(1);
    expect(courses[0].id).toBe('g1');
    expect(courses[0].schedule).toBe(
      'Lunes 08:00-10:00, Miércoles 08:00-10:00'
    );
  });
});
