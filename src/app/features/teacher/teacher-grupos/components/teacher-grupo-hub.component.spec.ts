import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherGrupoHubComponent } from './teacher-grupo-hub.component';
import { Course } from '../../../../core/models/course.model';

// LB-001B.1B (DB source of truth cleanup, PLAN.md AS-IS #13): retiro de la lectura de
// Course.docenteName sintetizado en la ficha del hub.

describe('TeacherGrupoHubComponent', () => {
  let fixture: ComponentFixture<TeacherGrupoHubComponent>;

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
      imports: [TeacherGrupoHubComponent],
    });
    fixture = TestBed.createComponent(TeacherGrupoHubComponent);
  });

  it('no renderiza docenteName en la ficha de encabezado del grupo', () => {
    fixture.componentRef.setInput('selectedCourse', course);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain(MARCADOR_DOCENTE);
  });

  // LB-001B.5A: HorarioDocente no entrega aula; QR de sesión y Cancelar no tienen contrato.
  it('no presenta aula aunque el curso la traiga (legacy) ni la pestaña "Horario & Aula"', () => {
    fixture.componentRef.setInput('selectedCourse', course);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain('Aula');
    expect(text).not.toContain('A-204');
    expect(text).toContain('Horario');
  });

  it('oculta "Proyectar Auto-Registro" (QR de sesión) por defecto y lo muestra solo con feature explícita', () => {
    fixture.componentRef.setInput('selectedCourse', course);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Proyectar Auto-Registro');

    fixture.componentRef.setInput('sessionQrEnabled', true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Proyectar Auto-Registro');
  });
});
