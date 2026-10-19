import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminDecanosComponent } from './admin-decanos.component';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { environment } from '../../../../environments/environment';

describe('AdminDecanosComponent', () => {
  let fixture: ComponentFixture<AdminDecanosComponent>;
  let component: AdminDecanosComponent;
  let adminService: AdminManagementService;
  let catalogService: CatalogService;
  let toastService: jasmine.SpyObj<ToastService>;
  let http: HttpTestingController;

  const mockDecanos = [
    {
      id: 'dec-1',
      tipoIdentificacionId: 'tipo-1',
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '1017001',
      primerNombre: 'Roberto',
      segundoNombre: '',
      primerApellido: 'Gómez',
      segundoApellido: '',
      nombres: 'Roberto',
      apellidos: 'Gómez',
      nombreCompleto: 'Roberto Gómez',
      correo: 'rgomez@uco.edu.co',
      facultad: 'Facultad de Ingeniería',
      telefono: '5698000',
      fechaAsignacion: '2026-01-01',
      estado: 'ACTIVO' as const,
    },
    {
      id: 'dec-2',
      tipoIdentificacionId: 'tipo-1',
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '1017002',
      primerNombre: 'María',
      segundoNombre: '',
      primerApellido: 'Pérez',
      segundoApellido: '',
      nombres: 'María',
      apellidos: 'Pérez',
      nombreCompleto: 'María Pérez',
      correo: 'mperez@uco.edu.co',
      facultad: 'Facultad de Ciencias Económicas',
      telefono: '5698001',
      fechaAsignacion: '2026-01-15',
      estado: 'INACTIVO' as const,
    },
  ];

  beforeEach(async () => {
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [AdminDecanosComponent],
      providers: [
        AdminManagementService,
        CatalogService,
        { provide: ToastService, useValue: toastService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    adminService = TestBed.inject(AdminManagementService);
    catalogService = TestBed.inject(CatalogService);
    fixture = TestBed.createComponent(AdminDecanosComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  function flushInitialRequests() {
    fixture.detectChanges();

    // Catalogos
    const reqTipos = http.expectOne(`${environment.apiUrl}/tipos-identificacion`);
    reqTipos.flush({
      exitoso: true,
      datos: [{ id: 'tipo-1', tipoIdentificacion: 'CC', nombre: 'Cédula de Ciudadanía' }],
    });

    const reqFacs = http.expectOne(`${environment.apiUrl}/admin/facultades`);
    reqFacs.flush({ datos: [{ id: 'fac-1', nombre: 'Facultad de Ingeniería' }] });

    const reqDecanos = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    reqDecanos.flush({ exitoso: true, datos: mockDecanos });

    http.match(`${environment.apiUrl}/coordinador/planes-estudio`).forEach((r) => r.flush({ exitoso: true, datos: [] }));
    http.match(`${environment.apiUrl}/coordinador/periodos-academicos`).forEach((r) => r.flush({ exitoso: true, datos: [] }));
    http.match(`${environment.apiUrl}/docentes`).forEach((r) => r.flush([]));
    http.match(`${environment.apiUrl}/coordinador/docentes`).forEach((r) => r.flush({ exitoso: true, datos: [] }));

    fixture.detectChanges();
  }

  it('debe crearse e inicializar lista de decanos y catálogos', () => {
    flushInitialRequests();
    expect(component).toBeTruthy();
    expect(component.decanos().length).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  it('filteredDecanos filtra por término de búsqueda', () => {
    flushInitialRequests();
    component.searchQuery = 'roberto';
    component.decanos.set([...component.decanos()]);
    fixture.detectChanges();

    expect(component.filteredDecanos().length).toBe(1);
    expect(component.filteredDecanos()[0].nombres).toBe('Roberto');
  });

  it('filteredDecanos filtra por estado', () => {
    flushInitialRequests();
    component.selectedEstado = 'INACTIVO';
    component.decanos.set([...component.decanos()]);
    fixture.detectChanges();

    expect(component.filteredDecanos().length).toBe(1);
    expect(component.filteredDecanos()[0].nombres).toBe('María');
  });

  it('abrirFormularioRegistro cambia la vista a REGISTRO', () => {
    flushInitialRequests();
    component.abrirFormularioRegistro();
    expect(component.vistaActual()).toBe('REGISTRO');
  });

  it('volverALista restablece la vista a LISTA', () => {
    flushInitialRequests();
    component.abrirFormularioRegistro();
    component.volverALista();
    expect(component.vistaActual()).toBe('LISTA');
  });

  it('toggleEstado envía solicitud para cambiar estado y muestra notificación', () => {
    flushInitialRequests();
    component.toggleEstado(mockDecanos[0]);

    const req = http.expectOne(`${environment.apiUrl}/admin/decanos/dec-1/toggle`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ exitoso: true, datos: { ...mockDecanos[0], estado: 'INACTIVO' } });

    expect(toastService.success).toHaveBeenCalled();
  });

  it('onNumeroIdentificacionInput filtra caracteres no numéricos', () => {
    flushInitialRequests();
    const event = { target: { value: '1017-abc-888' } } as unknown as Event;
    component.onNumeroIdentificacionInput(event);

    expect(component.formData.numeroIdentificacion).toBe('1017888');
  });

  it('guardarDecano valida campos obligatorios antes de enviar', () => {
    flushInitialRequests();
    component.abrirFormularioRegistro();

    // Sin documento
    component.formData.numeroIdentificacion = '';
    component.guardarDecano();
    expect(toastService.warning).toHaveBeenCalled();

    // Documento válido pero sin nombres
    component.formData.numeroIdentificacion = '1017123456';
    component.formData.primerNombre = '';
    component.guardarDecano();
    expect(toastService.warning).toHaveBeenCalled();

    // Con nombre pero sin apellido
    component.formData.primerNombre = 'Fernando';
    component.formData.primerApellido = '';
    component.guardarDecano();
    expect(toastService.warning).toHaveBeenCalled();

    // Con apellido pero correo inválido
    component.formData.primerApellido = 'Ochoa';
    component.formData.correo = 'correo-invalido';
    component.guardarDecano();
    expect(toastService.warning).toHaveBeenCalled();
  });

  it('guardarDecano envía POST y registra el nuevo decano', () => {
    flushInitialRequests();
    component.abrirFormularioRegistro();
    component.formData.numeroIdentificacion = '1017999888';
    component.formData.primerNombre = 'Fernando';
    component.formData.primerApellido = 'Ochoa';
    component.formData.correo = 'fernando.ochoa@uco.edu.co';
    component.formData.facultad = 'Facultad de Ingeniería';

    component.guardarDecano();

    const req = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    expect(req.request.method).toBe('POST');
    req.flush({
      exitoso: true,
      mensajeUsuario: 'Decano creado con éxito.',
      datos: {
        id: 'dec-nuevo',
        ...component.formData,
      },
    });

    expect(component.decanos().length).toBe(3);
    expect(component.vistaActual()).toBe('LISTA');
    expect(toastService.success).toHaveBeenCalled();
  });

  it('abrirModalSeleccionarDecano y onSolicitarRegistroNuevo gestionan estado del modal', () => {
    flushInitialRequests();
    expect(component.isPickerModalOpen()).toBeFalse();
    component.abrirModalSeleccionarDecano();
    expect(component.isPickerModalOpen()).toBeTrue();
    component.onSolicitarRegistroNuevo();
    expect(component.isPickerModalOpen()).toBeFalse();
    expect(component.vistaActual()).toBe('REGISTRO');
  });

  it('onDecanoSeleccionadoDelDirectorio avisa si el usuario ya es decano', () => {
    flushInitialRequests();
    component.onDecanoSeleccionadoDelDirectorio({
      id: 'dec-1',
      numeroIdentificacion: '1017001',
      nombres: 'Roberto',
      apellidos: 'Gómez',
      correo: 'rgomez@uco.edu.co',
    });

    expect(toastService.info).toHaveBeenCalled();
  });

  it('onDecanoSeleccionadoDelDirectorio nombra al usuario como nuevo decano', () => {
    flushInitialRequests();
    component.onDecanoSeleccionadoDelDirectorio({
      id: 'usr-nuevo-dec',
      numeroIdentificacion: '1017333222',
      nombres: 'Elena',
      apellidos: 'Castro',
      correo: 'elena.castro@uco.edu.co',
      tipoIdentificacion: 'CC',
    });

    const req = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    expect(req.request.method).toBe('POST');
    req.flush({
      exitoso: true,
      datos: {
        id: 'usr-nuevo-dec',
        tipoIdentificacionId: 'tipo-1',
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '1017333222',
        primerNombre: 'Elena',
        primerApellido: 'Castro',
        nombres: 'Elena',
        apellidos: 'Castro',
        correo: 'elena.castro@uco.edu.co',
        facultad: 'Facultad de Ingeniería',
        telefono: '5698000',
        fechaAsignacion: '2026-02-01',
        estado: 'ACTIVO',
      },
    });

    expect(component.decanos().some((d) => d.id === 'usr-nuevo-dec')).toBeTrue();
    expect(toastService.success).toHaveBeenCalled();
  });
});
