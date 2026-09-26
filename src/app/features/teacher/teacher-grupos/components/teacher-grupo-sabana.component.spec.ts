import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TeacherGrupoSabanaComponent } from './teacher-grupo-sabana.component';
import { ClassSession } from '../../../../core/models/attendance.model';

// LB-001B.1B (DB source of truth cleanup, PLAN.md AS-IS #25): el indicador visual por
// sesión ([class]/[title]) lee ClassSession.status, campo sintético que se retira sin
// sustituto. La nota del PLAN confirma que la síntesis AN/SJC por paridad de ID en este
// archivo ya fue retirada por LB-001B.1A; lo pendiente aquí es exclusivamente `ses.status`.

describe('TeacherGrupoSabanaComponent', () => {
  let fixture: ComponentFixture<TeacherGrupoSabanaComponent>;

  const session: ClassSession = {
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
      imports: [TeacherGrupoSabanaComponent],
    });
    fixture = TestBed.createComponent(TeacherGrupoSabanaComponent);
    fixture.componentRef.setInput('estudiantes', [
      { studentId: 'st-1', studentName: 'Ada', studentCode: '001' },
    ]);
    fixture.componentRef.setInput('sessions', [session]);
    fixture.componentRef.setInput('cargando', false);
    fixture.detectChanges();
  });

  it('no expone el status sintético de la sesión como title del indicador', () => {
    const dot = fixture.debugElement.query(By.css('th span[title]'));
    expect(dot).toBeTruthy();
    expect((dot.nativeElement as HTMLElement).getAttribute('title')).not.toBe('CONCLUIDA');
  });
});
