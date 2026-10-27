import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { StudentEnrollmentRequestsComponent } from './student-enrollment-requests.component';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { environment } from '../../../../environments/environment';

const LISTA = `${environment.apiUrl}/estudiante/solicitudes-matricula`;
const GRUPO = '11111111-2222-3333-4444-555555555555';

const solicitudApi = (id: string, estado: string, motivoRechazo: string | null = null) => ({
  id,
  grupoId: GRUPO,
  grupoCodigo: 1,
  grupoNombre: 'Grupo 1',
  asignaturaId: 'asg-1',
  asignaturaNombre: 'Cálculo',
  docenteNombre: 'Doc Uno',
  estado,
  fechaSolicitudUtc: '2026-10-27T13:00:00Z',
  fechaResolucionUtc: null,
  motivoRechazo,
});

describe('StudentEnrollmentRequestsComponent (HU053-HU055: mis solicitudes de ingreso)', () => {
  let fixture: ComponentFixture<StudentEnrollmentRequestsComponent>;
  let component: StudentEnrollmentRequestsComponent;
  let http: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  function crear(grupo: string | null): void {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);
    TestBed.configureTestingModule({
      imports: [StudentEnrollmentRequestsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(grupo ? { grupo } : {}) } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentEnrollmentRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => http.verify());

  it('SE-01 lista mis solicitudes con estado, grupo y motivo de rechazo; retirar solo en abiertas', () => {
    crear(null);
    http.expectOne((r) => r.url === LISTA).flush({
      exitoso: true,
      total: 3,
      datos: [solicitudApi('s1', 'PENDIENTE'), solicitudApi('s2', 'RECHAZADA', 'Cupo reservado'), solicitudApi('s3', 'EN_ESPERA')],
    });
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Cálculo');
    expect(texto).toContain('Cupo reservado');
    expect(texto).toContain('En espera');
    expect(fixture.nativeElement.querySelectorAll('button[data-accion="retirar-solicitud"]')).toHaveSize(2);
  });

  it('SE-02 el enlace del docente (?grupo=) precarga el grupo y solicita el ingreso', () => {
    crear(GRUPO);
    http.expectOne((r) => r.url === LISTA).flush({ exitoso: true, datos: [], total: 0 });
    expect(component.grupoId()).toBe(GRUPO);

    component.solicitar();
    const req = http.expectOne((r) => r.url === LISTA && r.method === 'POST');
    expect(req.request.body).toEqual({ grupoId: GRUPO });
    req.flush({ exitoso: true, datos: { id: 's9' } });

    expect(toastSpy.success).toHaveBeenCalled();
    http.expectOne((r) => r.url === LISTA && r.method === 'GET').flush({ exitoso: true, datos: [], total: 0 });
  });

  it('SE-03 grupo vacío o inválido no llama al backend; un 409 muestra el mensaje', () => {
    crear(null);
    http.expectOne((r) => r.url === LISTA).flush({ exitoso: true, datos: [], total: 0 });

    component.grupoId.set('no-es-uuid');
    component.solicitar();
    expect(component.error()).toContain('identificador');
    http.expectNone((r) => r.method === 'POST');

    component.grupoId.set(GRUPO);
    component.solicitar();
    http.expectOne((r) => r.method === 'POST').flush(
      { exitoso: false, message: 'Ya existe una solicitud abierta para este grupo.' },
      { status: 409, statusText: 'Conflict' }
    );
    expect(component.error()).toContain('Ya existe una solicitud abierta');
  });

  it('SE-04 retirar una solicitud abierta y recargar', () => {
    crear(null);
    http.expectOne((r) => r.url === LISTA).flush({ exitoso: true, datos: [solicitudApi('s1', 'PENDIENTE')], total: 1 });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button[data-accion="retirar-solicitud"]') as HTMLButtonElement).click();
    const req = http.expectOne(`${LISTA}/s1/retiro`);
    expect(req.request.method).toBe('POST');
    req.flush({ exitoso: true, datos: null });
    expect(toastSpy.success).toHaveBeenCalled();
    http.expectOne((r) => r.url === LISTA && r.method === 'GET').flush({ exitoso: true, datos: [], total: 0 });
  });

  it('SE-05 filtro por estado y error al cargar', () => {
    crear(null);
    http.expectOne((r) => r.url === LISTA).flush({ exitoso: true, datos: [], total: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No tienes solicitudes de ingreso');

    component.onEstadoChange('RECHAZADA');
    const req = http.expectOne((r) => r.url === LISTA);
    expect(req.request.params.get('estado')).toBe('RECHAZADA');
    req.flush({ exitoso: false }, { status: 500, statusText: 'Error' });
    expect(component.solicitudes()).toEqual([]);
    expect(toastSpy.error).toHaveBeenCalled();
  });
});
