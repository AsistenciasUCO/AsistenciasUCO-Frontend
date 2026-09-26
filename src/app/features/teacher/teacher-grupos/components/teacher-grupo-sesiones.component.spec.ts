import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherGrupoSesionesComponent } from './teacher-grupo-sesiones.component';
import { ClassSession } from '../../../../core/models/attendance.model';

// LB-001B.1B: la Sesion no tiene estado (`status`) en el frontend; nada gobierna "Ajustar Horario".
// LB-001B.5A: HorarioDocente/Sesion no entregan aula, y QR/PIN + Cancelar no tienen contrato en
// BACKEND_GOLDEN_PATH_CONTRACT → OUT_OF_GOLDEN_PATH, ocultas salvo feature explícita.

describe('TeacherGrupoSesionesComponent', () => {
  let fixture: ComponentFixture<TeacherGrupoSesionesComponent>;

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

  const text = () => (fixture.nativeElement as HTMLElement).textContent || '';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeacherGrupoSesionesComponent],
    });
    fixture = TestBed.createComponent(TeacherGrupoSesionesComponent);
    fixture.componentRef.setInput('sessions', [sesion]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('mantiene "Ajustar Horario" y "Detalles" sin depender de ningún estado sintético de sesión', () => {
    expect(text()).toContain('Ajustar Horario');
    expect(text()).toContain('Detalles');
  });

  it('no presenta "Aula del grupo": el contrato no entrega aula', () => {
    expect(text()).not.toContain('Aula');
  });

  it('no muestra QR / PIN ni Cancelar por defecto (OUT_OF_GOLDEN_PATH)', () => {
    expect(text()).not.toContain('QR / PIN');
    expect(text()).not.toContain('Cancelar');
  });

  it('QR / PIN y Cancelar solo aparecen con su feature habilitada explícitamente', () => {
    fixture.componentRef.setInput('qrEnabled', true);
    fixture.componentRef.setInput('cancelEnabled', true);
    fixture.detectChanges();

    expect(text()).toContain('QR / PIN');
    expect(text()).toContain('Cancelar');
  });
});
