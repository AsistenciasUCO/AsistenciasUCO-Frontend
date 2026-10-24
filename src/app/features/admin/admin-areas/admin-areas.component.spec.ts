import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AdminAreasComponent } from './admin-areas.component';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { AreaConocimientoItem } from '../../../core/models/role-management.model';

describe('AdminAreasComponent - áreas de conocimiento (HU151/HU152)', () => {
  let fixture: ComponentFixture<AdminAreasComponent>;
  let component: AdminAreasComponent;
  let service: jasmine.SpyObj<AdminManagementService> & { areas: any };
  let toast: jasmine.SpyObj<ToastService>;

  const pre: AreaConocimientoItem = { id: 't-1', codigo: 'ISW', nombre: 'Ingeniería de Software', activa: true };
  const pos: AreaConocimientoItem = { id: 't-2', codigo: 'CBA', nombre: 'Ciencias Básicas', activa: false };

  beforeEach(async () => {
    service = Object.assign(
      jasmine.createSpyObj('AdminManagementService', [
        'cargarAreas',
        'crearArea',
        'actualizarArea',
        'cambiarEstadoArea',
      ]),
      { areas: signal<AreaConocimientoItem[]>([pre, pos]).asReadonly() }
    );
    service.cargarAreas.and.returnValue(of({ exitoso: true, datos: [pre, pos] }));
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [AdminAreasComponent],
      providers: [
        { provide: AdminManagementService, useValue: service },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga el catalogo al iniciar y lo muestra con codigo, nombre y estado', () => {
    expect(service.cargarAreas).toHaveBeenCalled();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('ISW');
    expect(texto).toContain('Ingeniería de Software');
    expect(texto).toContain('CBA');
    expect(texto).toContain('Inactiva');
  });

  it('muestra el mensaje del backend si la carga falla', () => {
    service.cargarAreas.and.returnValue(throwError(() => ({ error: { message: 'Sin permisos' } })));

    component.ngOnInit();

    expect(toast.error).toHaveBeenCalledWith('Sin permisos');
  });

  it('usa un mensaje de respaldo si el error de carga no trae mensaje', () => {
    service.cargarAreas.and.returnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(toast.error).toHaveBeenCalledWith('No fue posible cargar las áreas de conocimiento.');
  });

  it('crear envia codigo y nombre, informa el exito y cierra el formulario', () => {
    service.crearArea.and.returnValue(
      of({ exitoso: true, datos: { id: 't-3', codigo: 'HUM', nombre: 'Humanidades', activa: true } })
    );
    component.abrirNuevo();
    component.form.codigo = 'hum';
    component.form.nombre = 'Humanidades';

    component.guardar();

    expect(service.crearArea).toHaveBeenCalledWith({ codigo: 'hum', nombre: 'Humanidades' });
    expect(toast.success).toHaveBeenCalledWith('Área de conocimiento registrada correctamente.');
    expect(component.formularioAbierto()).toBeFalse();
    expect(component.guardando()).toBeFalse();
  });

  it('crear con conflicto muestra el mensaje del backend y mantiene el formulario abierto', () => {
    service.crearArea.and.returnValue(
      throwError(() => ({ status: 409, error: { message: 'Ya existe un Área de conocimiento registrada con este codigo.' } }))
    );
    component.abrirNuevo();
    component.form.codigo = 'ISW';
    component.form.nombre = 'otro';

    component.guardar();

    expect(toast.error).toHaveBeenCalledWith('Ya existe un Área de conocimiento registrada con este codigo.');
    expect(component.formularioAbierto()).toBeTrue();
    expect(component.guardando()).toBeFalse();
  });

  it('crear con respuesta no exitosa muestra mensajeUsuario del backend', () => {
    service.crearArea.and.returnValue(of({ exitoso: false, mensajeUsuario: 'Dato invalido', datos: null as any }));
    component.abrirNuevo();
    component.form.codigo = 'HUM';
    component.form.nombre = 'Humanidades';

    component.guardar();

    expect(toast.error).toHaveBeenCalledWith('Dato invalido');
    expect(component.formularioAbierto()).toBeTrue();
  });

  it('no envia si el formulario es invalido o ya hay una peticion en curso', () => {
    component.abrirNuevo();
    component.form.codigo = 'AB';
    component.form.nombre = 'x';
    component.guardar();
    expect(service.crearArea).not.toHaveBeenCalled();

    component.form.codigo = 'HUM';
    component.form.nombre = 'Humanidades';
    component.guardando.set(true);
    component.guardar();
    expect(service.crearArea).not.toHaveBeenCalled();
  });

  it('editar abre el formulario con el codigo bloqueado y solo envia el nombre', () => {
    service.actualizarArea.and.returnValue(of({ exitoso: true, datos: { ...pre, nombre: 'Ingeniería de Software II' } }));

    component.abrirEdicion(pre);
    expect(component.edicion()).toEqual(pre);
    expect(component.form.codigo).toBe('ISW');
    component.form.nombre = 'Ingeniería de Software II';

    component.guardar();

    expect(service.actualizarArea).toHaveBeenCalledWith('t-1', { nombre: 'Ingeniería de Software II' });
    expect(toast.success).toHaveBeenCalledWith('Área de conocimiento actualizada correctamente.');
    expect(component.formularioAbierto()).toBeFalse();
  });

  it('editar con error muestra el mensaje del backend y conserva el formulario', () => {
    service.actualizarArea.and.returnValue(throwError(() => ({ error: { message: 'Nombre duplicado' } })));
    component.abrirEdicion(pre);
    component.form.nombre = 'Ciencias Básicas';

    component.guardar();

    expect(toast.error).toHaveBeenCalledWith('Nombre duplicado');
    expect(component.formularioAbierto()).toBeTrue();
  });

  it('alternar estado envia el estado deseado contrario al actual', () => {
    service.cambiarEstadoArea.and.returnValue(of({ exitoso: true, datos: { ...pre, activa: false } }));

    component.alternarEstado(pre);

    expect(service.cambiarEstadoArea).toHaveBeenCalledWith('t-1', false);
    expect(toast.success).toHaveBeenCalledWith('Área de conocimiento desactivada correctamente.');
    expect(component.cambiandoEstadoId()).toBeNull();
  });

  it('alternar estado de un tipo inactiva lo activa', () => {
    service.cambiarEstadoArea.and.returnValue(of({ exitoso: true, datos: { ...pos, activa: true } }));

    component.alternarEstado(pos);

    expect(service.cambiarEstadoArea).toHaveBeenCalledWith('t-2', true);
    expect(toast.success).toHaveBeenCalledWith('Área de conocimiento activada correctamente.');
  });

  it('alternar estado con error muestra el mensaje del backend', () => {
    service.cambiarEstadoArea.and.returnValue(throwError(() => ({ error: { message: 'No existe' } })));

    component.alternarEstado(pre);

    expect(toast.error).toHaveBeenCalledWith('No existe');
    expect(component.cambiandoEstadoId()).toBeNull();
  });

  it('alternar estado con respuesta no exitosa informa el error', () => {
    service.cambiarEstadoArea.and.returnValue(of({ exitoso: false, mensajeUsuario: 'Rechazado', datos: null as any }));

    component.alternarEstado(pre);

    expect(toast.error).toHaveBeenCalledWith('Rechazado');
  });

  it('cancelar cierra el formulario', () => {
    component.abrirNuevo();
    expect(component.formularioAbierto()).toBeTrue();

    component.cancelar();

    expect(component.formularioAbierto()).toBeFalse();
  });
});
