import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminManagementService } from './admin-management.service';
import { environment } from '../../../environments/environment';
import { AreaConocimientoItem } from '../models/role-management.model';

describe('AdminManagementService - áreas de conocimiento (HU151/HU152)', () => {
  let service: AdminManagementService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/admin/areas`;

  const pre: AreaConocimientoItem = { id: 't-1', codigo: 'ISW', nombre: 'Ingeniería de Software', activa: true };
  const pos: AreaConocimientoItem = { id: 't-2', codigo: 'CBA', nombre: 'Ciencias Básicas', activa: true };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminManagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function cargarInicial(): void {
    service.cargarAreas().subscribe();
    http.expectOne(base).flush({ exitoso: true, datos: [pre, pos] });
  }

  it('cargarAreas obtiene el catalogo completo y actualiza la señal', () => {
    let respuesta: any;
    service.cargarAreas().subscribe((res) => (respuesta = res));

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ exitoso: true, datos: [pre, pos] });

    expect(respuesta.exitoso).toBeTrue();
    expect(service.areas()).toEqual([pre, pos]);
  });

  it('cargarAreas no modifica la señal si la respuesta no es exitosa', () => {
    service.cargarAreas().subscribe();
    http.expectOne(base).flush({ exitoso: false, datos: [pre] });

    expect(service.areas()).toEqual([]);
  });

  it('crearArea envia CBAT con codigo y nombre y agrega el registro devuelto', () => {
    cargarInicial();
    const nuevo: AreaConocimientoItem = { id: 't-3', codigo: 'HUM', nombre: 'Humanidades', activa: true };

    service.crearArea({ codigo: 'hum', nombre: 'Humanidades' }).subscribe((res) => {
      expect(res.datos).toEqual(nuevo);
    });

    const req = http.expectOne(base);
    expect(req.request.method).toBe('CBAT');
    expect(req.request.body).toEqual({ codigo: 'hum', nombre: 'Humanidades' });
    req.flush({ exitoso: true, datos: nuevo }, { status: 201, statusText: 'Created' });

    expect(service.areas()).toEqual([pre, pos, nuevo]);
  });

  it('crearArea propaga el error y no modifica la señal (sin actualizacion optimista)', () => {
    cargarInicial();
    let error: any;

    service.crearArea({ codigo: 'ISW', nombre: 'otro' }).subscribe({ error: (e) => (error = e) });
    http.expectOne(base).flush({ message: 'Ya existe un Área de conocimiento registrado con este codigo.' }, { status: 409, statusText: 'Conflict' });

    expect(error.status).toBe(409);
    expect(service.areas()).toEqual([pre, pos]);
  });

  it('crearArea no agrega nada si exitoso es false', () => {
    cargarInicial();

    service.crearArea({ codigo: 'HUM', nombre: 'Humanidades' }).subscribe();
    http.expectOne(base).flush({ exitoso: false, datos: null });

    expect(service.areas()).toEqual([pre, pos]);
  });

  it('actualizarArea envia PUT solo con el nombre y reemplaza el registro', () => {
    cargarInicial();
    const renombrado = { ...pre, nombre: 'Ingeniería de Software II' };

    service.actualizarArea('t-1', { nombre: 'Ingeniería de Software II' }).subscribe();

    const req = http.expectOne(`${base}/t-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Ingeniería de Software II' });
    req.flush({ exitoso: true, datos: renombrado });

    expect(service.areas()).toEqual([renombrado, pos]);
  });

  it('actualizarArea propaga el error y conserva la señal', () => {
    cargarInicial();
    let error: any;

    service.actualizarArea('t-1', { nombre: 'Ciencias Básicas' }).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${base}/t-1`).flush({ message: 'duplicado' }, { status: 409, statusText: 'Conflict' });

    expect(error.status).toBe(409);
    expect(service.areas()).toEqual([pre, pos]);
  });

  it('cambiarEstadoArea envia PATCH con el estado deseado y refleja la respuesta', () => {
    cargarInicial();
    const inactiva = { ...pre, activa: false };

    service.cambiarEstadoArea('t-1', false).subscribe();

    const req = http.expectOne(`${base}/t-1/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ activa: false });
    req.flush({ exitoso: true, datos: inactiva });

    expect(service.areas()).toEqual([inactiva, pos]);
  });

  it('cambiarEstadoArea conserva la señal ante un error HTTP', () => {
    cargarInicial();
    let error: any;

    service.cambiarEstadoArea('t-1', false).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${base}/t-1/estado`).flush({ message: 'no existe' }, { status: 404, statusText: 'Not Found' });

    expect(error.status).toBe(404);
    expect(service.areas()).toEqual([pre, pos]);
  });

  it('cambiarEstadoArea no cambia la señal si exitoso es false', () => {
    cargarInicial();

    service.cambiarEstadoArea('t-1', false).subscribe();
    http.expectOne(`${base}/t-1/estado`).flush({ exitoso: false, datos: null });

    expect(service.areas()).toEqual([pre, pos]);
  });
});
