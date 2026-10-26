import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeanEstudiantesComponent } from './dean-estudiantes.component';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { environment } from '../../../../environments/environment';
import { EstudianteFacultadItem } from '../../../core/models/facultad-decano.model';

const BASE = `${environment.apiUrl}/decano/estudiantes`;

const estudiante: EstudianteFacultadItem = {
  idEstudiante: 'est-1',
  numeroIdentificacion: '1017000111',
  nombreCompleto: 'Ana Ruiz',
  correo: 'ana@uco.edu.co',
  activo: true,
  programas: 'Ingeniería de Sistemas',
  totalGrupos: 2,
};

describe('DeanEstudiantesComponent (HU104/HU105)', () => {
  let fixture: ComponentFixture<DeanEstudiantesComponent>;
  let component: DeanEstudiantesComponent;
  let http: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);
    TestBed.configureTestingModule({
      imports: [DeanEstudiantesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ToastService, useValue: toastSpy }],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DeanEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('pagina')).toBe('1');
    expect(req.request.params.get('tamano')).toBe('10');
    expect(req.request.params.has('busqueda')).toBeFalse();
    expect(req.request.params.has('estaActivo')).toBeFalse();
    req.flush({ exitoso: true, datos: [estudiante], total: 1 });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('HU104: lista el directorio con programas, grupos y estado', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(component.total()).toBe(1);
    expect(texto).toContain('Ana Ruiz');
    expect(texto).toContain('Ingeniería de Sistemas');
    expect(texto).toContain('Activo');
  });

  it('HU105: busca por texto y filtra por estado reiniciando la página', () => {
    component.pagina.set(3);
    component.busqueda.set(' 1017 ');
    component.buscar();
    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('busqueda')).toBe('1017');
    expect(req.request.params.get('pagina')).toBe('1');
    req.flush({ exitoso: true, datos: [], total: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay estudiantes que coincidan con la búsqueda.');

    component.onEstadoChange('INACTIVO');
    expect(http.expectOne((r) => r.url === BASE).request.params.get('estaActivo')).toBe('false');
    component.onEstadoChange('ACTIVO');
    expect(http.expectOne((r) => r.url === BASE).request.params.get('estaActivo')).toBe('true');
  });

  it('paginación y tamaño recargan la consulta', () => {
    component.onPagina(2);
    expect(http.expectOne((r) => r.url === BASE).request.params.get('pagina')).toBe('2');
    component.onTamano(20);
    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('tamano')).toBe('20');
    expect(req.request.params.get('pagina')).toBe('1');
  });

  it('un error del backend limpia la lista y muestra el mensaje', () => {
    component.buscar();
    http.expectOne((r) => r.url === BASE).flush({ exitoso: false }, { status: 403, statusText: 'Forbidden' });
    expect(component.estudiantes()).toEqual([]);
    expect(toastSpy.error).toHaveBeenCalled();
  });

  it('HU105: abre y cierra la ficha con las matrículas del estudiante', () => {
    component.verFicha(estudiante);
    http.expectOne(`${BASE}/est-1`).flush({
      exitoso: true,
      datos: {
        idEstudiante: 'est-1',
        numeroIdentificacion: '1017000111',
        nombreCompleto: 'Ana Ruiz',
        activo: true,
        matriculas: [
          {
            idPrograma: 'p-1',
            nombrePrograma: 'Ingeniería de Sistemas',
            inpPlanEstudio: 20241,
            idAsignatura: 'a-1',
            nombreAsignatura: 'Cálculo',
            idGrupo: 'g-1',
            nombreGrupo: 'Grupo 1',
          },
        ],
      },
    });
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('1 matrículas');
    expect(texto).toContain('Cálculo');

    component.cerrarFicha();
    expect(component.ficha()).toBeNull();
  });

  it('HU105: error al abrir la ficha muestra el mensaje', () => {
    component.verFicha(estudiante);
    http.expectOne(`${BASE}/est-1`).flush({ exitoso: false }, { status: 404, statusText: 'Not Found' });
    expect(component.ficha()).toBeNull();
    expect(toastSpy.error).toHaveBeenCalled();
  });
});
