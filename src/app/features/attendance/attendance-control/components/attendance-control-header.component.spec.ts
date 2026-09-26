import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassSession } from '../../../../core/models/attendance.model';
import { AttendanceControlHeaderComponent } from './attendance-control-header.component';

// LB-001B.5A: la Sesion no tiene lifecycle/status en el frontend (BACKEND_GOLDEN_PATH_CONTRACT §C.2).
// SESSION_SYNTHETIC_LIFECYCLE_COUNT = 0: nada de "Clase Activa", "Asistencia Consolidada",
// "Sesión Finalizada y Consolidada" ni "Registro Cerrado", y tampoco un sustituto inventado.

describe('AttendanceControlHeaderComponent', () => {
  let fixture: ComponentFixture<AttendanceControlHeaderComponent>;
  let component: AttendanceControlHeaderComponent;

  const session: ClassSession = {
    id: 'ses-1',
    courseId: 'g1',
    sessionNumber: 1,
    title: 'Sesión 1',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '10:00',
    records: [],
  };

  const text = () => (fixture.nativeElement as HTMLElement).textContent || '';
  const button = (label: RegExp) =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => label.test(b.textContent || '')
    )!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceControlHeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AttendanceControlHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedCourseId', 'g1');
    fixture.componentRef.setInput('sessions', [session]);
    fixture.componentRef.setInput('currentSession', session);
    fixture.detectChanges();
  });

  it('SESSION_SYNTHETIC_LIFECYCLE_COUNT = 0: no aparece ningún estado sintético de sesión', () => {
    for (const synthetic of [
      'Clase Activa',
      'Asistencia Consolidada',
      'Sesión Finalizada',
      'Consolidada',
      'Registro Cerrado',
      'Solo Lectura',
      'PROGRAMADA',
      'EN_CURSO',
      'CONCLUIDA',
    ]) {
      expect(text()).not.toContain(synthetic);
    }
  });

  it('no existe el input isSessionConcluded', () => {
    expect('isSessionConcluded' in component).toBeFalse();
  });

  it('con features activas, sesión seleccionada y sin guardado, "Todos Presentes/Ausentes" están habilitados', () => {
    expect(button(/Todos Presentes/).disabled).toBeFalse();
    expect(button(/Todos Ausentes/).disabled).toBeFalse();
  });

  it('deshabilita el marcado masivo solo por features, guardado en curso o falta de sesión', () => {
    fixture.componentRef.setInput('isSaving', true);
    fixture.detectChanges();
    expect(button(/Todos Presentes/).disabled).toBeTrue();
    fixture.componentRef.setInput('isSaving', false);

    fixture.componentRef.setInput('sessionsEnabled', false);
    fixture.detectChanges();
    expect(button(/Todos Ausentes/).disabled).toBeTrue();
    expect(text()).toContain('Sesiones deshabilitadas');
    fixture.componentRef.setInput('sessionsEnabled', true);

    fixture.componentRef.setInput('attendanceEnabled', false);
    fixture.detectChanges();
    expect(button(/Todos Presentes/).disabled).toBeTrue();
    fixture.componentRef.setInput('attendanceEnabled', true);

    fixture.componentRef.setInput('currentSession', undefined);
    fixture.detectChanges();
    expect(button(/Todos Presentes/).disabled).toBeTrue();
  });
});
