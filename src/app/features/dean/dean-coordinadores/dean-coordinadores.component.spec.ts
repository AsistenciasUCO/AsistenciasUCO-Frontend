import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeanCoordinadoresComponent } from './dean-coordinadores.component';
import { DeanManagementService } from '../../../core/services/dean-management.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { environment } from '../../../../environments/environment';
import { CoordinadorItem } from '../../../core/models/role-management.model';

describe('DeanCoordinadoresComponent', () => {
  let fixture: ComponentFixture<DeanCoordinadoresComponent>;
  let component: DeanCoordinadoresComponent;
  let deanService: DeanManagementService;
  let catalogService: CatalogService;
  let toastService: jasmine.SpyObj<ToastService>;
  let http: HttpTestingController;

  const mockCoordinadores: CoordinadorItem[] = [
    {
      id: 'coord-1',
      numeroIdentificacion: '1017001',
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'cramirez@uco.edu.co',
      programaAcademico: 'Ingeniería de Sistemas',
      telefono: '5698000',
      fechaAsignacion: '2026-01-01',
      estado: 'ACTIVO',
      totalDocentes: 10,
      totalGrupos: 15,
    },
    {
      id: 'coord-2',
      numeroIdentificacion: '1017002',
      nombres: 'Ana',
      apellidos: 'Gómez',
      correo: 'agomez@uco.edu.co',
      programaAcademico: 'Ingeniería Industrial',
      telefono: '5698001',
      fechaAsignacion: '2026-01-15',
      estado: 'INACTIVO',
      totalDocentes: 8,
      totalGrupos: 12,
    },
  ];

  beforeEach(async () => {
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [DeanCoordinadoresComponent],
      providers: [
        DeanManagementService,
        CatalogService,
        { provide: ToastService, useValue: toastService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    deanService = TestBed.inject(DeanManagementService);
    catalogService = TestBed.inject(CatalogService);
    fixture = TestBed.createComponent(DeanCoordinadoresComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  function flushInitialRequests() {
    fixture.detectChanges();

    const reqTipos = http.expectOne(`${environment.apiUrl}/tipos-identificacion`);
    reqTipos.flush({
      exitoso: true,
      datos: [{ id: 'tipo-1', tipoIdentificacion: 'CC', nombre: 'Cédula de Ciudadanía' }],
    });

    const reqCoords = http.expectOne(`${environment.apiUrl}/decano/coordinadores`);
    reqCoords.flush({ exitoso: true, datos: mockCoordinadores });

    fixture.detectChanges();
  }

  it('debe crearse e inicializar lista de coordinadores', () => {
    flushInitialRequests();
    expect(component).toBeTruthy();
    expect(component.coordinadores().length).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  it('filteredCoordinadores filtra por texto de búsqueda', () => {
    flushInitialRequests();
    component.searchQuery = 'carlos';
    fixture.detectChanges();

    expect(component.filteredCoordinadores().length).toBe(1);
    expect(component.filteredCoordinadores()[0].nombres).toBe('Carlos');
  });

  it('filteredCoordinadores filtra por estado', () => {
    flushInitialRequests();
    component.selectedEstado = 'INACTIVO';
    fixture.detectChanges();

    expect(component.filteredCoordinadores().length).toBe(1);
    expect(component.filteredCoordinadores()[0].nombres).toBe('Ana');
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

  it('toggleEstadoCoordinador envía PATCH para alternar estado y notifica', () => {
    flushInitialRequests();
    component.toggleEstadoCoordinador(mockCoordinadores[0]);

    const req = http.expectOne(`${environment.apiUrl}/decano/coordinadores/coord-1/toggle`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ exitoso: true, datos: { ...mockCoordinadores[0], estado: 'INACTIVO' } });

    expect(toastService.success).toHaveBeenCalled();
  });
});
