import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TeacherGrupoFormComponent } from './teacher-grupo-form.component';

// LB-001B.1B (DB source of truth cleanup, PLAN.md AS-IS #23): el placeholder del campo
// "Docente Responsable" sugiere hardcodear el literal 'Dra. María Elena Rostagno', el mismo
// texto sintetizado que se retira de course.service.ts/course.mock.ts/teacher-grupos.component.ts.
// TARGET: el formulario deja de sugerir/editar ese literal sintetizado.

describe('TeacherGrupoFormComponent', () => {
  let fixture: ComponentFixture<TeacherGrupoFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeacherGrupoFormComponent],
    });
    fixture = TestBed.createComponent(TeacherGrupoFormComponent);
    fixture.detectChanges();
  });

  it('no sugiere el literal sintetizado "Dra. María Elena Rostagno" como placeholder', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input[type="text"]'));
    const placeholders = inputs.map((i) => (i.nativeElement as HTMLInputElement).placeholder);

    expect(placeholders).not.toContain('Ej. Dra. María Elena Rostagno');
  });
});
