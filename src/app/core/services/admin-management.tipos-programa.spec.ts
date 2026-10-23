import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminManagementService } from './admin-management.service';
import { environment } from '../../../environments/environment';
import { TipoProgramaItem } from '../models/role-management.model';

describe('AdminManagementService - tipos de programa (HU154)', () => {
  let service: AdminManagementService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/admin/tipos-programa`;

  const pre: TipoProgramaItem = { id: 't-1', codigo: 'PRE', nombre: 'pregrado', activo: true };
  const pos: TipoProgramaItem = { id: 't-2', codigo: 'POS', nombre: 'postgrado', activo: true };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminManagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function cargarInicial(): void {
    service.cargarTiposPrograma().subscribe();
    http.expectOne(base).flush({ exitoso: true, datos: [pre, pos] });
  }

  it('cargarTiposPrograma obtiene el catalogo completo y actualiza la señal', () => {
    let respuesta: any;
    service.cargarTiposPrograma().subscribe((res) => (respuesta = res));

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ exitoso: true, datos: [pre, pos] });

    expect(respuesta.exitoso).toBeTrue();
    expect(service.tiposPrograma()).toEqual([pre, pos]);
  });

  it('cargarTiposPrograma no modifica la señal si la respuesta no es exitosa', () => {
    service.cargarTiposPrograma().subscribe();
    http.expectOne(base).flush({ exitoso: false, datos: [pre] });

    expect(service.tiposPrograma()).toEqual([]);
  });

  it('crearTipoPrograma envia POST con codigo y nombre y agrega el registro devuelto', () => {
    cargarInicial();
    const nuevo: TipoProgramaItem = { id: 't-3', codigo: 'ESP', nombre: 'especializacion', activo: true };

    service.crearTipoPrograma({ codigo: 'esp', nombre: 'especializacion' }).subscribe((res) => {
      expect(res.datos).toEqual(nuevo);
    });

    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ codigo: 'esp', nombre: 'especializacion' });
    req.flush({ exitoso: true, datos: nuevo }, { status: 201, statusText: 'Created' });

    expect(service.tiposPrograma()).toEqual([pre, pos, nuevo]);
  });

  it('crearTipoPrograma propaga el error y no modifica la señal (sin actualizacion optimista)', () => {
    cargarInicial();
    let error: any;

    service.crearTipoPrograma({ codigo: 'PRE', nombre: 'otro' }).subscribe({ error: (e) => (error = e) });
    http.expectOne(base).flush({ message: 'Ya existe un Tipo de Programa registrado con este codigo.' }, { status: 409, statusText: 'Conflict' });

    expect(error.status).toBe(409);
    expect(service.tiposPrograma()).toEqual([pre, pos]);
  });

  it('crearTipoPrograma no agrega nada si exitoso es false', () => {
    cargarInicial();

    service.crearTipoPrograma({ codigo: 'ESP', nombre: 'especializacion' }).subscribe();
    http.expectOne(base).flush({ exitoso: false, datos: null });

    expect(service.tiposPrograma()).toEqual([pre, pos]);
  });

  it('actualizarTipoPrograma envia PUT solo con el nombre y reemplaza el registro', () => {
    cargarInicial();
    const renombrado = { ...pre, nombre: 'pregrado universitario' };

    service.actualizarTipoPrograma('t-1', { nombre: 'pregrado universitario' }).subscribe();

    const req = http.expectOne(`${base}/t-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'pregrado universitario' });
    req.flush({ exitoso: true, datos: renombrado });

    expect(service.tiposPrograma()).toEqual([renombrado, pos]);
  });

  it('actualizarTipoPrograma propaga el error y conserva la señal', () => {
    cargarInicial();
    let error: any;

    service.actualizarTipoPrograma('t-1', { nombre: 'postgrado' }).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${base}/t-1`).flush({ message: 'duplicado' }, { status: 409, statusText: 'Conflict' });

    expect(error.status).toBe(409);
    expect(service.tiposPrograma()).toEqual([pre, pos]);
  });

  it('cambiarEstadoTipoPrograma envia PATCH con el estado deseado y refleja la respuesta', () => {
    cargarInicial();
    const inactivo = { ...pre, activo: false };

    service.cambiarEstadoTipoPrograma('t-1', false).subscribe();

    const req = http.expectOne(`${base}/t-1/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ activo: false });
    req.flush({ exitoso: true, datos: inactivo });

    expect(service.tiposPrograma()).toEqual([inactivo, pos]);
  });

  it('cambiarEstadoTipoPrograma conserva la señal ante un error HTTP', () => {
    cargarInicial();
    let error: any;

    service.cambiarEstadoTipoPrograma('t-1', false).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${base}/t-1/estado`).flush({ message: 'no existe' }, { status: 404, statusText: 'Not Found' });

    expect(error.status).toBe(404);
    expect(service.tiposPrograma()).toEqual([pre, pos]);
  });

  it('cambiarEstadoTipoPrograma no cambia la señal si exitoso es false', () => {
    cargarInicial();

    service.cambiarEstadoTipoPrograma('t-1', false).subscribe();
    http.expectOne(`${base}/t-1/estado`).flush({ exitoso: false, datos: null });

    expect(service.tiposPrograma()).toEqual([pre, pos]);
  });
});
