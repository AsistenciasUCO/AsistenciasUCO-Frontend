import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherGruposListComponent } from './teacher-grupos-list.component';
import { Course } from '../../../../core/models/course.model';

// LB-001B.1B (DB source of truth cleanup, PLAN.md AS-IS #24): retiro de la lectura de
// Course.docenteName sintetizado en la tarjeta de listado de grupos.

describe('TeacherGruposListComponent', () => {
  let fixture: ComponentFixture<TeacherGruposListComponent>;

  const MARCADOR_DOCENTE = 'MARCADOR-DOCENTE-NO-DEBE-RENDERIZARSE';

  const course: Course = {
    id: 'crs-1',
    code: 'MAT-301',
    name: 'Matemática Avanzada III',
    section: 'Sección A',
    schedule: 'Lun, Mié 08:00 - 10:00 AM',
    room: 'Aula A-204',
    enrolledStudentsCount: 32,
    cupoMaximo: 35,
    docenteName: MARCADOR_DOCENTE,
    colorCategory: 'emerald',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeacherGruposListComponent],
    });
    fixture = TestBed.createComponent(TeacherGruposListComponent);
  });

  it('no renderiza docenteName en la tarjeta del grupo', () => {
    fixture.componentRef.setInput('courses', [course]);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain(MARCADOR_DOCENTE);
  });

  // LB-001B.5A: sin aula (HorarioDocente no la entrega) y sin QR de sesión (sin contrato).
  it('no presenta aula ni permite buscar por aula', () => {
    fixture.componentRef.setInput('courses', [course]);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain('A-204');
    expect(text).not.toContain('Aula');
    expect(fixture.componentInstance.filteredCourses().length).toBe(1);
    fixture.componentInstance.searchQuery.set('a-204');
    expect(fixture.componentInstance.filteredCourses()).toEqual([]);
  });

  it('tolera cursos sin room (Course.room opcional) sin lanzar', () => {
    const { room, ...sinAula } = course;
    fixture.componentRef.setInput('courses', [sinAula]);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentInstance.searchQuery.set('mat');

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.componentInstance.filteredCourses().length).toBe(1);
  });

  it('oculta "QR Asistencia" por defecto y lo muestra solo con feature explícita', () => {
    fixture.componentRef.setInput('courses', [course]);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('QR Asistencia');

    fixture.componentRef.setInput('sessionQrEnabled', true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('QR Asistencia');
  });
});
