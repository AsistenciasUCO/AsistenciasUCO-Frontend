import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentClaimFormComponent } from './student-claim-form.component';
import { SOPORTE_ACCEPT } from '../../../../core/files/soporte-file.validator';

describe('StudentClaimFormComponent — soporte (LB-004D FE-01..FE-03)', () => {
  let fixture: ComponentFixture<StudentClaimFormComponent>;
  let component: StudentClaimFormComponent;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StudentClaimFormComponent] });
    fixture = TestBed.createComponent(StudentClaimFormComponent);
    component = fixture.componentInstance;
    setInputs({
      materia: { id: 'm-1', nombre: 'Matemáticas', docente: 'Prof. X' },
      sesion: { id: 's-1', numeroSesion: 3, fecha: '2026-10-19', horario: '08:00', estadoAsistencia: 'AUSENTE', tema: 'Álgebra' },
    });
  });

  it('anuncia el límite real de 5 MB y restringe el selector a PDF/PNG/JPEG', () => {
    expect(host().textContent).toContain('Máx. 5 MB');
    expect(host().textContent).not.toContain('10MB');
    const input = host().querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.getAttribute('accept')).toBe(SOPORTE_ACCEPT);
  });

  it('el soporte es opcional: se puede radicar solo con la justificación', () => {
    const emitted: unknown[] = [];
    component.submitted.subscribe((value) => emitted.push(value));
    component.justificacion.set('  Cita médica  ');
    component.onSubmit();
    expect(emitted).toEqual([{ categoria: 'Médico / Salud', justificacion: 'Cita médica' }]);
  });

  it('no emite una justificación vacía', () => {
    const emitted: unknown[] = [];
    component.submitted.subscribe((value) => emitted.push(value));
    component.justificacion.set('   ');
    component.onSubmit();
    expect(emitted).toEqual([]);
  });

  it('muestra el estado de subida con opción de cancelar y oculta el selector mientras sube', () => {
    let removed = 0;
    component.removeFile.subscribe(() => removed++);
    setInputs({ subiendo: true });

    expect(host().textContent).toContain('Subiendo y analizando');
    expect(host().querySelector('input[type="file"]')).toBeNull();
    (Array.from(host().querySelectorAll('button')).find((b) => b.textContent?.includes('Cancelar') && b.className.includes('red')) as HTMLButtonElement).click();
    expect(removed).toBe(1);
  });

  it('muestra el error del soporte de forma accesible', () => {
    setInputs({ errorSoporte: 'El archivo supera el tamaño máximo permitido de 5 MB.' });
    const alert = host().querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('5 MB');
  });

  it('muestra el adjunto ya cargado y permite removerlo', () => {
    let removed = 0;
    component.removeFile.subscribe(() => removed++);
    setInputs({ archivo: { fileId: 'f-1', nombre: 'evidencia.pdf', tipo: 'application/pdf', tamanioKb: 4, fechaSubida: '2026-10-19' } });

    expect(host().textContent).toContain('evidencia.pdf');
    (host().querySelector('button[title="Remover adjunto"]') as HTMLButtonElement).click();
    expect(removed).toBe(1);
  });

  it('propaga la selección de archivo al contenedor', () => {
    const events: Event[] = [];
    component.fileSelected.subscribe((event) => events.push(event));
    const input = host().querySelector('input[type="file"]') as HTMLInputElement;
    input.dispatchEvent(new Event('change'));
    expect(events.length).toBe(1);
  });
});
