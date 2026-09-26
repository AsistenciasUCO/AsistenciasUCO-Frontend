import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceNewSessionModalComponent } from './attendance-new-session-modal.component';

describe('AttendanceNewSessionModalComponent', () => {
  let fixture: ComponentFixture<AttendanceNewSessionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AttendanceNewSessionModalComponent],
    });
    fixture = TestBed.createComponent(AttendanceNewSessionModalComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  });

  it('no muestra inputs fantasma de Sesion', () => {
    const text = fixture.nativeElement.textContent as string;
    const html = fixture.nativeElement.innerHTML as string;

    expect(text).toContain('Título de la Sesión');
    expect(text).toContain('Fecha de la Sesión');
    expect(text).toContain('Hora Inicio');
    expect(text).toContain('Hora Fin');

    expect(text).not.toContain('Tipo de Sesión');
    expect(text).not.toContain('Aula / Espacio Físico');
    expect(text).not.toContain('Temática');
    expect(text).not.toContain('Descripción');
    expect(html).not.toContain('name="tipoSesion"');
    expect(html).not.toContain('name="aula"');
    expect(html).not.toContain('name="descripcion"');
  });

  it('emite solo datos persistibles de Sesion', () => {
    const emitted: unknown[] = [];
    fixture.componentInstance.submitted.subscribe((payload) => emitted.push(payload));

    fixture.componentInstance.title.set('Sesion contractual');
    fixture.componentInstance.date.set('2026-09-23');
    fixture.componentInstance.startTime.set('08:00');
    fixture.componentInstance.endTime.set('10:00');
    fixture.componentInstance.onSubmit(new Event('submit'));

    expect(emitted).toEqual([
      {
        title: 'Sesion contractual',
        date: '2026-09-23',
        startTime: '08:00',
        endTime: '10:00',
      },
    ]);
  });
});

describe('AttendanceNewSessionModalComponent nombre 1..50', () => {
  it('limita a 50, muestra mensaje y no emite con 51 caracteres', () => {
    TestBed.configureTestingModule({ imports: [AttendanceNewSessionModalComponent] });
    const fixture = TestBed.createComponent(AttendanceNewSessionModalComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.submitted.subscribe((p) => emitted.push(p));

    fixture.componentInstance.title.set('x'.repeat(51));
    fixture.detectChanges();
    fixture.componentInstance.onSubmit(new Event('submit'));

    const input = fixture.nativeElement.querySelector('input[name="titulo"]') as HTMLInputElement;
    expect(input.maxLength).toBe(50);
    expect(emitted).toEqual([]);
    expect(fixture.nativeElement.textContent as string).toContain('entre 1 y 50');

    fixture.componentInstance.title.set('x'.repeat(50));
    fixture.componentInstance.onSubmit(new Event('submit'));
    expect(emitted.length).toBe(1);
  });
});
