import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService, MOCK_DOCUMENT_TYPES } from './catalog.service';
import { environment } from '../../../environments/environment';

describe('CatalogService', () => {
  let service: CatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CatalogService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getIdentityDocumentTypes retorna tipos desde HTTP cuando no usa mocks', () => {
    const originalMock = environment.useFrontendMocks;
    environment.useFrontendMocks = false;

    service.getIdentityDocumentTypes().subscribe((tipos) => {
      expect(tipos.length).toBe(2);
      expect(tipos[0].tipoIdentificacion).toBe('CC');
    });

    const req = http.expectOne(`${environment.apiUrl}/tipos-identificacion`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: '1', tipoIdentificacion: 'CC', nombre: 'Cédula de Ciudadanía' },
      { id: '2', tipoIdentificacion: 'TI', nombre: 'Tarjeta de Identidad' },
    ]);

    environment.useFrontendMocks = originalMock;
  });

  it('getTiposIdentificacion retorna respuesta encapsulada desde HTTP', () => {
    const originalMock = environment.useFrontendMocks;
    environment.useFrontendMocks = false;

    service.getTiposIdentificacion().subscribe((res) => {
      expect(res.exitoso).toBeTrue();
      expect(res.datos.length).toBe(1);
      expect(res.datos[0].tipoIdentificacion).toBe('CC');
    });

    const req = http.expectOne(`${environment.apiUrl}/tipos-identificacion`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', tipoIdentificacion: 'CC', nombre: 'Cédula de Ciudadanía' }]);

    environment.useFrontendMocks = originalMock;
  });

  it('getFacultades retorna datos desde HTTP cuando el backend responde', () => {
    const originalMock = environment.useFrontendMocks;
    environment.useFrontendMocks = false;

    service.getFacultades().subscribe((res) => {
      expect(res.exitoso).toBeTrue();
      expect(res.datos.length).toBe(1);
      expect(res.datos[0].nombre).toBe('Facultad de Ingeniería');
    });

    const req = http.expectOne(`${environment.apiUrl}/admin/facultades`);
    expect(req.request.method).toBe('GET');
    req.flush({ datos: [{ id: 'fac-1', nombre: 'Facultad de Ingeniería' }] });

    environment.useFrontendMocks = originalMock;
  });

  it('getProgramasAcademicos retorna el catálogo institucional por defecto', (done) => {
    service.getProgramasAcademicos().subscribe((res) => {
      expect(res.exitoso).toBeTrue();
      expect(res.datos.length).toBeGreaterThan(0);
      expect(res.datos.some((p) => p.nombre.includes('Ingeniería de Sistemas'))).toBeTrue();
      done();
    });
  });

  it('getDepartamentosAcademicos retorna la lista institucional', (done) => {
    service.getDepartamentosAcademicos().subscribe((res) => {
      expect(res.exitoso).toBeTrue();
      expect(res.datos.length).toBeGreaterThan(0);
      expect(res.datos.includes('Ingeniería de Sistemas')).toBeTrue();
      done();
    });
  });
});
