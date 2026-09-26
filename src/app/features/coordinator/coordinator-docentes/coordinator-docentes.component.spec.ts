import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CoordinatorDocentesComponent } from './coordinator-docentes.component';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { DocenteItem } from '../../../core/models/role-management.model';

// LB-001B.1B (DB source of truth cleanup, PLAN.md AS-IS #19): verFichaDocente() empareja
// cursos por coincidencia de texto libre contra Course.docenteName, incluyendo literales
// fallback 'maria'/'docente' que emparejan casi cualquier curso (fragilidad aguas abajo del
// hardcode de course.service.ts:83). TARGET: se retira la lectura de docenteName; sin
// sustituto sintético, la ficha no debe "inventar" cursos del docente por este heurístico.

describe('CoordinatorDocentesComponent', () => {
  let fixture: ComponentFixture<CoordinatorDocentesComponent>;
  let component: CoordinatorDocentesComponent;
  let coordinatorService: jasmine.SpyObj<CoordinatorManagementService>;
  let catalogService: jasmine.SpyObj<CatalogService>;
  let courseService: jasmine.SpyObj<CourseService>;

  const docente: DocenteItem = {
    id: 'doc-1',
    numeroIdentificacion: '9999',
    nombres: 'Roberto',
    apellidos: 'Gómez',
  } as DocenteItem;

  const cursoNoRelacionado: Course = {
    id: 'crs-1',
    code: 'MAT-301',
    name: 'Matemática Avanzada III',
    section: 'Sección A',
    schedule: 'Lun, Mié 08:00 - 10:00 AM',
    room: 'Aula A-204',
    enrolledStudentsCount: 32,
    cupoMaximo: 35,
    // Contiene el literal fallback 'docente' que hoy produce coincidencias falsas.
    docenteName: 'Equipo Docente Regular',
    colorCategory: 'emerald',
  };

  beforeEach(() => {
    coordinatorService = jasmine.createSpyObj<CoordinatorManagementService>(
      'CoordinatorManagementService',
      ['getDocentes', 'toggleDocenteStatus']
    );
    catalogService = jasmine.createSpyObj<CatalogService>('CatalogService', [
      'getTiposIdentificacion',
    ]);
    courseService = jasmine.createSpyObj<CourseService>('CourseService', [
      'getTeacherCourses',
    ]);

    coordinatorService.getDocentes.and.returnValue(
      of({ exitoso: true, datos: [docente] } as any)
    );
    catalogService.getTiposIdentificacion.and.returnValue(
      of({ exitoso: true, datos: [] } as any)
    );
    courseService.getTeacherCourses.and.returnValue(
      of({ exitoso: true, datos: [cursoNoRelacionado] } as any)
    );

    TestBed.configureTestingModule({
      imports: [CoordinatorDocentesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CoordinatorManagementService, useValue: coordinatorService },
        { provide: CatalogService, useValue: catalogService },
        { provide: CourseService, useValue: courseService },
      ],
    });

    fixture = TestBed.createComponent(CoordinatorDocentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('verFichaDocente() ya no empareja cursos por el fallback de texto libre sobre docenteName', () => {
    component.verFichaDocente(docente);

    expect(component.cursosDocente()).toEqual([]);
  });
});
