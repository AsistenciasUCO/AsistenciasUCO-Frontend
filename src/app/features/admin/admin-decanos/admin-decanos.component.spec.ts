import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AdminDecanosComponent } from './admin-decanos.component';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { environment } from '../../../../environments/environment';

describe('AdminDecanosComponent', () => {
  let fixture: ComponentFixture<AdminDecanosComponent>;
  let component: AdminDecanosComponent;
  let adminService: AdminManagementService;
  let toastService: jasmine.SpyObj<ToastService>;
  let http: HttpTestingController;

  const mockDecanos = [
    {
      id: 'dec-1',
      idUsuario: 'usr-1',
      numeroIdentificacion: '1017000001',
      primerNombre: 'Roberto',
      primerApellido: 'Gómez',
      nombres: 'Roberto',
      apellidos: 'Gómez',
      nombreCompleto: 'Roberto Gómez',
      correo: 'rgomez@uco.edu.co',
      facultad: 'Facultad de Ingeniería',
      idFacultad: 'fac-1',
      telefono: '123456',
      fechaAsignacion: '2026-01-01',
      estado: 'ACTIVO' as const,
      estaActivoDecano: true,
    },
  ];

  const mockTiposDoc = [
    { id: 'tipo-1', tipoIdentificacion: 'CC', nombre: 'Cédula de Ciudadanía', codigo: 'CC', estado: 'ACTIVO' as const },
  ];

  const mockFacultades = [
    { id: 'fac-1', codigo: 'ING', nombre: 'Facultad de Ingeniería', estado: 'ACTIVO' as const },
    { id: 'fac-2', codigo: 'SAL', nombre: 'Facultad de Ciencias de la Salud', estado: 'ACTIVO' as const },
  ];

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    TestBed.configureTestingModule({
      imports: [AdminDecanosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastSpy },
        { provide: TeacherService, useValue: { getAllTeachers: () => of([]) } },
        { provide: CoordinatorManagementService, useValue: { getDocentes: () => of({ exitoso: true, datos: [] }) } },
      ],
    });

    adminService = TestBed.inject(AdminManagementService);
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    http = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(AdminDecanosComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    http.verify();
  });

  function satisfyInitRequests() {
    // 1. Tipos de identificación
    const reqTipos = http.expectOne(`${environment.apiUrl}/tipos-identificacion`);
    reqTipos.flush(mockTiposDoc);

    // 2. Facultades
    const reqFac = http.expectOne(`${environment.apiUrl}/admin/facultades`);
    reqFac.flush({ exitoso: true, datos: mockFacultades });

    // 3. Decanos
    const reqDec = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    reqDec.flush({ exitoso: true, datos: mockDecanos });
  }

  it('debe crearse y cargar datos iniciales correctamente', () => {
    fixture.detectChanges();
    satisfyInitRequests();

    expect(component).toBeTruthy();
    expect(component.decanos().length).toBe(1);
    expect(component.facultades().length).toBe(2);
    expect(component.tiposIdentificacion().length).toBe(1);
  });

  it('permite registrar decano sin facultad asignada para resolver círculo de inconsistencia', () => {
    fixture.detectChanges();
    satisfyInitRequests();

    component.abrirFormularioRegistro();
    expect(component.vistaActual()).toBe('REGISTRO');

    // Llenar formulario sin asignar facultad (idFacultad: null)
    component.formData.tipoIdentificacionId = 'tipo-1';
    component.formData.numeroIdentificacion = '1020304050';
    component.formData.primerNombre = 'Carlos';
    component.formData.primerApellido = 'Zapata';
    component.formData.correo = 'carlos.zapata@uco.edu.co';
    component.formData.idFacultad = null;

    component.guardarDecano();

    const reqPost = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    expect(reqPost.request.method).toBe('POST');
    expect(reqPost.request.body.primerNombre).toBe('Carlos');
    expect(reqPost.request.body.idFacultad).toBeNull();

    reqPost.flush({ exitoso: true, mensaje: 'Decano creado correctamente.' });

    // Se disparan recargas tras guardado exitoso
    const reqDecReload = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    reqDecReload.flush({ exitoso: true, datos: mockDecanos });

    const reqFacReload = http.expectOne(`${environment.apiUrl}/admin/facultades`);
    reqFacReload.flush({ exitoso: true, datos: mockFacultades });

    expect(toastService.success).toHaveBeenCalled();
    expect(component.vistaActual()).toBe('LISTA');
  });

  it('el formulario no requiere facultad y persiste el decano con idFacultad nulo', () => {
    fixture.detectChanges();
    satisfyInitRequests();

    component.abrirFormularioRegistro();
    component.formData.tipoIdentificacionId = 'tipo-1';
    component.formData.numeroIdentificacion = '1020304051';
    component.formData.primerNombre = 'Ana';
    component.formData.primerApellido = 'Mora';
    component.formData.correo = 'ana.mora@uco.edu.co';

    component.guardarDecano();

    const reqPost = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    expect(reqPost.request.method).toBe('POST');
    expect(reqPost.request.body.idFacultad).toBeNull();

    reqPost.flush({ exitoso: true, mensaje: 'Decano creado correctamente.' });

    const reqDecReload = http.expectOne(`${environment.apiUrl}/admin/decanos`);
    reqDecReload.flush({ exitoso: true, datos: mockDecanos });

    const reqFacReload = http.expectOne(`${environment.apiUrl}/admin/facultades`);
    reqFacReload.flush({ exitoso: true, datos: mockFacultades });

    expect(toastService.success).toHaveBeenCalled();
    expect(component.vistaActual()).toBe('LISTA');
  });
});
