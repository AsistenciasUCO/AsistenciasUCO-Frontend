import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeanCoordinadorEstadoModalComponent } from './dean-coordinador-estado-modal.component';
import { CoordinadorItem } from '../../../../core/models/role-management.model';

describe('DeanCoordinadorEstadoModalComponent (HU122)', () => {
  let fixture: ComponentFixture<DeanCoordinadorEstadoModalComponent>;
  let component: DeanCoordinadorEstadoModalComponent;
  let confirmaciones: number;
  let cancelaciones: number;

  const activo: CoordinadorItem = {
    id: 'coord-1',
    numeroIdentificacion: '1017001',
    nombres: 'Carlos',
    apellidos: 'Ramírez',
    correo: 'cramirez@uco.edu.co',
    facultad: 'Facultad de Ingeniería',
    programaAcademico: 'Ingeniería de Sistemas',
    estado: 'ACTIVO',
    totalDocentes: 10,
    totalGrupos: 15,
  };

  function render(item: CoordinadorItem): string {
    fixture.componentRef.setInput('coordinador', item);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function boton(accion: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`button[data-accion="${accion}"]`) as HTMLButtonElement;
  }

  beforeEach(async () => {
    confirmaciones = 0;
    cancelaciones = 0;
    await TestBed.configureTestingModule({ imports: [DeanCoordinadorEstadoModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(DeanCoordinadorEstadoModalComponent);
    component = fixture.componentInstance;
    component.confirmar.subscribe(() => confirmaciones++);
    component.cancelar.subscribe(() => cancelaciones++);
  });

  it('para un coordinador activo pide confirmar la desactivación y nombra a la persona', () => {
    const texto = render(activo);

    expect(texto).toContain('Desactivar');
    expect(texto).toContain('Carlos');
    expect(texto).toContain('Ramírez');
  });

  it('para un coordinador inactivo ofrece la reactivación', () => {
    const texto = render({ ...activo, estado: 'INACTIVO' });

    expect(texto).toContain('Reactivar');
  });

  it('emite confirmar al pulsar el botón de confirmación', () => {
    render(activo);

    boton('confirmar').click();

    expect(confirmaciones).toBe(1);
    expect(cancelaciones).toBe(0);
  });

  it('emite cancelar al pulsar cancelar sin confirmar', () => {
    render(activo);

    boton('cancelar').click();

    expect(cancelaciones).toBe(1);
    expect(confirmaciones).toBe(0);
  });
});
