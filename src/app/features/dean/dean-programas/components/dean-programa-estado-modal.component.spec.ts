import { TestBed } from '@angular/core/testing';
import { DeanProgramaEstadoModalComponent } from './dean-programa-estado-modal.component';
import { ProgramaAcademico } from '../../../../core/models/programa-academico.model';

describe('DeanProgramaEstadoModalComponent', () => {
  const programa: ProgramaAcademico = {
    id: 'p-1', nombre: 'Sistemas', idTipoPrograma: 't-1', nombreTipoPrograma: 'pregrado',
    idModalidad: null, nombreModalidad: null, idJornada: null, nombreJornada: null,
    idCoordinador: 'c-1', nombreCoordinador: 'Ana Pérez', idFacultad: 'f-1', nombreFacultad: 'Ingeniería', estaActivo: true,
  };

  function crear(activo: boolean) {
    const fixture = TestBed.createComponent(DeanProgramaEstadoModalComponent);
    fixture.componentRef.setInput('programa', { ...programa, estaActivo: activo });
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [DeanProgramaEstadoModalComponent] }));

  it('el estado destino es el contrario al actual', () => {
    expect(crear(true).componentInstance.estadoDestino()).toBeFalse();
    expect(crear(false).componentInstance.estadoDestino()).toBeTrue();
  });

  it('confirmar emite el estado destino explícito', () => {
    const fixture = crear(true);
    const emitido: boolean[] = [];
    fixture.componentInstance.confirmar.subscribe((v) => emitido.push(v));
    fixture.componentInstance.aceptar();
    expect(emitido).toEqual([false]);
  });

  it('cancelar emite cerrar sin confirmar', () => {
    const fixture = crear(false);
    let cerrado = false;
    let confirmado = false;
    fixture.componentInstance.cerrar.subscribe(() => (cerrado = true));
    fixture.componentInstance.confirmar.subscribe(() => (confirmado = true));
    fixture.componentInstance.cancelar();
    expect(cerrado).toBeTrue();
    expect(confirmado).toBeFalse();
  });

  it('muestra el error del backend sin reinterpretarlo', () => {
    const fixture = crear(true);
    fixture.componentRef.setInput('error', 'No se puede desactivar el programa porque tiene grupos activos en el período vigente.');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('tiene grupos activos en el período vigente');
  });
});
