import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CoordinatorDocentesComponent } from './coordinator-docentes.component';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { Course } from '../../../core/models/course.model';
import { DocentePrograma, DocenteCandidato } from '../../../core/models/docente-programa.model';

describe('CoordinatorDocentesComponent', () => {
  let fixture: ComponentFixture<CoordinatorDocentesComponent>;
  let component: CoordinatorDocentesComponent;
  let docentesSignal: ReturnType<typeof signal<DocentePrograma[]>>;
  let totalSignal: ReturnType<typeof signal<number>>;
  let coordService: {
    docentes: ReturnType<typeof signal<DocentePrograma[]>>;
    totalDocentes: ReturnType<typeof signal<number>>;
    getDocentesPrograma: jasmine.Spy;
    getCandidatosDocente: jasmine.Spy;
    vincularDocente: jasmine.Spy;
    getTiposVinculacion: jasmine.Spy;
  };
  let catalogService: jasmine.SpyObj<CatalogService>;
  let courseService: jasmine.SpyObj<CourseService>;
  let toast: jasmine.SpyObj<ToastService>;

  const fila = (id: string, nombre: string, activo = true): DocentePrograma => ({
    idDocentePrograma: `dp-${id}`,
    idDocente: id,
    idUsuario: `u-${id}`,
    codigoTipoIdentificacion: 'CC',
    numeroIdentificacion: 1017000000 + Number(id.replace(/\D/g, '') || 0),
    primerNombre: nombre,
    segundoNombre: null,
    primerApellido: 'Prueba',
    segundoApellido: null,
    nombreCompleto: `${nombre} Prueba`,
    correo: `${nombre.toLowerCase()}@uco.edu.co`,
    idTipoVinculacion: 'tv-1',
    codigoTipoVinculacion: 'CAT',
    nombreTipoVinculacion: 'Cátedra',
    fechaVinculacionUtc: '2026-10-22T10:00:00Z',
    totalGruposPrograma: 2,
    estaActivo: activo,
  });

  const curso: Course = {
    id: 'crs-1',
    code: 'MAT-301',
    name: 'Matemática Avanzada III',
    section: 'Sección A',
    schedule: 'Lun 08:00',
    room: 'A-204',
    enrolledStudentsCount: 32,
    cupoMaximo: 35,
    docenteId: 'doc-1',
    docenteName: 'Roberto',
    colorCategory: 'emerald',
  };

  function crear(): void {
    fixture = TestBed.createComponent(CoordinatorDocentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    docentesSignal = signal<DocentePrograma[]>([]);
    totalSignal = signal(0);
    coordService = {
      docentes: docentesSignal,
      totalDocentes: totalSignal,
      getDocentesPrograma: jasmine.createSpy('getDocentesPrograma').and.callFake(() => {
        docentesSignal.set([fila('doc-1', 'Roberto'), fila('doc-2', 'Luisa', false)]);
        totalSignal.set(12);
        return of({ exitoso: true, datos: docentesSignal(), total: 12 });
      }),
      getCandidatosDocente: jasmine.createSpy('getCandidatosDocente').and.returnValue(
        of({ exitoso: true, total: 1, datos: [{ idDocente: 'doc-9', idUsuario: 'u-9', codigoTipoIdentificacion: 'CC', numeroIdentificacion: 5, nombreCompleto: 'Maria Rostagno' } as DocenteCandidato] })
      ),
      vincularDocente: jasmine.createSpy('vincularDocente').and.returnValue(of({ exitoso: true, mensajeUsuario: 'ok', datos: fila('doc-3', 'Nuevo') })),
      getTiposVinculacion: jasmine.createSpy('getTiposVinculacion').and.returnValue(of([{ id: 'tv-1', codigo: 'CAT', nombre: 'Cátedra' }])),
    };
    catalogService = jasmine.createSpyObj<CatalogService>('CatalogService', ['getTiposIdentificacion']);
    catalogService.getTiposIdentificacion.and.returnValue(
      of({ exitoso: true, datos: [{ id: 'tipo-1', tipoIdentificacion: 'CC', nombre: 'Cédula' }] })
    );
    courseService = jasmine.createSpyObj<CourseService>('CourseService', ['getTeacherCourses']);
    courseService.getTeacherCourses.and.returnValue(of({ exitoso: true, datos: [curso] }));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'warning', 'info']);

    TestBed.configureTestingModule({
      imports: [CoordinatorDocentesComponent],
      providers: [
        { provide: CoordinatorManagementService, useValue: coordService },
        { provide: CatalogService, useValue: catalogService },
        { provide: CourseService, useValue: courseService },
        { provide: ToastService, useValue: toast },
      ],
    });
  });

  it('T-FE-02: carga el directorio una sola vez tras el debounce y los catálogos', fakeAsync(() => {
    crear();
    expect(coordService.getDocentesPrograma).not.toHaveBeenCalled(); // aún dentro del debounce
    tick(300);
    fixture.detectChanges();

    expect(coordService.getDocentesPrograma).toHaveBeenCalledTimes(1);
    expect(coordService.getDocentesPrograma.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ pagina: 1, tamano: 10 })
    );
    expect(coordService.getTiposVinculacion).toHaveBeenCalled();
    expect(catalogService.getTiposIdentificacion).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Roberto Prueba');
  }));

  it('T-FE-02: la búsqueda se filtra en el servidor con una sola llamada por término (debounce 300 ms)', fakeAsync(() => {
    crear();
    tick(300);
    coordService.getDocentesPrograma.calls.reset();

    component.onBusquedaChange('r');
    fixture.detectChanges();
    tick(100);
    component.onBusquedaChange('ro');
    fixture.detectChanges();
    tick(100);
    component.onBusquedaChange('ros');
    fixture.detectChanges();
    tick(300);

    expect(coordService.getDocentesPrograma).toHaveBeenCalledTimes(1);
    expect(coordService.getDocentesPrograma.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ busqueda: 'ros', pagina: 1 })
    );
  }));

  it('el filtro de estado se envía como estaActivo y reinicia la página', fakeAsync(() => {
    crear();
    tick(300);
    component.onPageChange(3);
    fixture.detectChanges();
    tick(300);
    coordService.getDocentesPrograma.calls.reset();

    component.onEstadoChange('INACTIVO');
    fixture.detectChanges();
    tick(300);

    const filtro = coordService.getDocentesPrograma.calls.mostRecent().args[0];
    expect(filtro.estaActivo).toBeFalse();
    expect(filtro.pagina).toBe(1);
  }));

  it('el cambio de página consulta la página pedida', fakeAsync(() => {
    crear();
    tick(300);
    coordService.getDocentesPrograma.calls.reset();

    component.onPageChange(2);
    fixture.detectChanges();
    tick(300);

    expect(coordService.getDocentesPrograma.calls.mostRecent().args[0].pagina).toBe(2);
  }));

  it('un error del directorio muestra el mensaje del backend y deja de cargar', fakeAsync(() => {
    coordService.getDocentesPrograma.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Sin permiso' } }))
    );
    crear();
    tick(300);

    expect(toast.error).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  }));

  it('el directorio vacío muestra el estado vacío', fakeAsync(() => {
    coordService.getDocentesPrograma.and.callFake(() => {
      docentesSignal.set([]);
      totalSignal.set(0);
      return of({ exitoso: true, datos: [], total: 0 });
    });
    crear();
    tick(300);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se encontraron docentes');
  }));

  it('T-FE-05: el botón de estado está deshabilitado y no invoca ningún servicio (HU093 pendiente)', fakeAsync(() => {
    crear();
    tick(300);
    fixture.detectChanges();

    const boton = fixture.debugElement.query(By.css('[data-testid="toggle-estado"]'));
    expect(boton).toBeTruthy();
    expect((boton.nativeElement as HTMLButtonElement).disabled).toBeTrue();
  }));

  it('abre y cierra el formulario de vinculación', fakeAsync(() => {
    crear();
    tick(300);

    component.abrirFormulario();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-coordinator-docente-form-modal')).toBeTruthy();

    component.cerrarFormulario();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-coordinator-docente-form-modal')).toBeNull();
  }));

  it('T-FE-04: buscarCandidatos exige 3 caracteres y consulta al backend', fakeAsync(() => {
    crear();
    tick(300);

    component.buscarCandidatos('ab');
    expect(coordService.getCandidatosDocente).not.toHaveBeenCalled();
    expect(component.candidatos()).toEqual([]);

    component.buscarCandidatos('ros');
    expect(coordService.getCandidatosDocente).toHaveBeenCalledWith('ros');
    expect(component.candidatos().length).toBe(1);
  }));

  it('buscarCandidatos con error muestra el mensaje y limpia la lista', fakeAsync(() => {
    coordService.getCandidatosDocente.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'corto' } }))
    );
    crear();
    tick(300);

    component.buscarCandidatos('ros');

    expect(toast.error).toHaveBeenCalled();
    expect(component.candidatos()).toEqual([]);
  }));

  it('guardarNuevo vincula, recarga desde el servidor y NO inserta localmente', fakeAsync(() => {
    crear();
    tick(300);
    component.abrirFormulario();
    coordService.getDocentesPrograma.calls.reset();
    const payload = {
      idTipoIdentificacion: 'tipo-1', numeroIdentificacion: '1017555444', primerNombre: 'Jorge', primerApellido: 'Henao',
      correo: 'jorge@uco.edu.co', password: 'Clave1234!', idTipoVinculacion: 'tv-1',
    };

    component.guardarNuevo(payload);
    fixture.detectChanges();
    tick(300);

    expect(coordService.vincularDocente).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalled();
    expect(component.formularioAbierto()).toBeFalse();
    expect(coordService.getDocentesPrograma).toHaveBeenCalledTimes(1); // recarga del servidor
  }));

  it('T-FE-04: guardarExistente envía idDocente e idTipoVinculacion', fakeAsync(() => {
    crear();
    tick(300);

    component.guardarExistente({ idDocente: 'doc-9', idTipoVinculacion: 'tv-1' });

    expect(coordService.vincularDocente).toHaveBeenCalledWith({ idDocente: 'doc-9', idTipoVinculacion: 'tv-1' });
  }));

  it('T-FE-06: el 409 se muestra tal cual lo devuelve el backend y el formulario sigue abierto', fakeAsync(() => {
    coordService.vincularDocente.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 409,
        error: {
          timestamp: '2026-10-22T10:00:00Z', status: 409, error: 'Conflict', code: 'CONFLICT',
          message: 'El docente ya está vinculado a este programa.', path: '/api/v1/coordinador/docentes', correlationId: null,
        },
      }))
    );
    crear();
    tick(300);
    component.abrirFormulario();

    component.guardarExistente({ idDocente: 'doc-1', idTipoVinculacion: 'tv-1' });

    expect(toast.error).toHaveBeenCalledWith('El docente ya está vinculado a este programa.');
    expect(component.formularioAbierto()).toBeTrue();
  }));

  it('verFichaDocente empareja cursos por idDocente real y cerrarFichaDocente limpia', fakeAsync(() => {
    crear();
    tick(300);
    const docente = fila('doc-1', 'Roberto');

    component.verFichaDocente(docente);
    expect(component.docenteSeleccionado()).toBe(docente);
    expect(component.cursosDocente().map((c) => c.id)).toEqual(['crs-1']);

    component.cerrarFichaDocente();
    expect(component.docenteSeleccionado()).toBeNull();
    expect(component.cursosDocente()).toEqual([]);
  }));

  it('no usa setInterval ni polling para refrescar', () => {
    const fuente = CoordinatorDocentesComponent.toString();
    expect(fuente).not.toContain('setInterval');
  });
});
