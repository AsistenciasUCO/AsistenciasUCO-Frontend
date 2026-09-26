import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherSesionDetalleModalComponent } from './teacher-sesion-detalle-modal.component';
import { ClassSession } from '../../../../../core/models/attendance.model';

// LB-001B.1B (DB source of truth cleanup, PLAN.md AS-IS #26): el badge de estado de la
// sesión lee ClassSession.status (distinto de StudentAttendance.status / rec.status, que
// SÍ es un campo real y queda fuera de alcance). TARGET: se retira sin sustituto.

describe('TeacherSesionDetalleModalComponent', () => {
  let fixture: ComponentFixture<TeacherSesionDetalleModalComponent>;

  const sesion: ClassSession = {
    id: 'ses-1',
    courseId: 'crs-1',
    sessionNumber: 1,
    title: 'Sesión 1',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '10:00',
    records: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeacherSesionDetalleModalComponent],
    });
    fixture = TestBed.createComponent(TeacherSesionDetalleModalComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('sesion', sesion);
    fixture.detectChanges();
  });

  it('no renderiza el status sintético de la sesión ("PROGRAMADA") en el header del modal', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain('PROGRAMADA');
  });

  it('no presenta aula ni estado de cierre: el contrato no los entrega (LB-001B.5A)', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain('Aula');
    expect(text).not.toContain('Inmutable');
    expect(text).not.toContain('consolidad');
    expect('room' in fixture.componentInstance).toBeFalse();
  });

  it('mapea explicitamente null y estados reales de asistencia', () => {
    expect(fixture.componentInstance.statusLabel(null)).toBe('Sin registrar');
    expect(fixture.componentInstance.statusLabel('AN')).toBe('Presente');
    expect(fixture.componentInstance.statusLabel('SJC')).toBe('Falta SJC');
    expect(fixture.componentInstance.statusLabel('EX')).toBe('Excusa');
    expect(fixture.componentInstance.statusBadgeClasses(null)).toContain('warm');
  });
});
