import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SolicitudIngresoService } from './solicitud-ingreso.service';
import { environment } from '../../../environments/environment';
import { BYPASS_GLOBAL_ERROR_TOAST } from '../interceptors/error.interceptor';

const API = environment.apiUrl;

describe('SolicitudIngresoService (HU053-HU055)', () => {
  let service: SolicitudIngresoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SolicitudIngresoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('SV-01 el estudiante solicita el ingreso con el grupo en el cuerpo', () => {
    service.solicitar('grp-1').subscribe((res) => expect(res.datos?.id).toBe('sol-1'));
    const req = http.expectOne(`${API}/estudiante/solicitudes-matricula`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ grupoId: 'grp-1' });
    expect(req.request.context.get(BYPASS_GLOBAL_ERROR_TOAST)).toBeTrue();
    req.flush({ exitoso: true, datos: { id: 'sol-1' } });
  });

  it('SV-02 mis solicitudes con estado y paginación (sin estado si es TODOS)', () => {
    service.misSolicitudes({ estado: 'EN_ESPERA', pagina: 2, tamano: 5 }).subscribe();
    const req = http.expectOne((r) => r.url === `${API}/estudiante/solicitudes-matricula`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBe('EN_ESPERA');
    expect(req.request.params.get('pagina')).toBe('2');
    expect(req.request.params.get('tamano')).toBe('5');
    req.flush({ exitoso: true, datos: [], total: 0 });

    service.misSolicitudes({ pagina: 1, tamano: 10 }).subscribe();
    expect(http.expectOne((r) => r.url === `${API}/estudiante/solicitudes-matricula`).request.params.has('estado')).toBeFalse();
  });

  it('SV-03 el estudiante retira su solicitud', () => {
    service.retirar('sol-1').subscribe();
    const req = http.expectOne(`${API}/estudiante/solicitudes-matricula/sol-1/retiro`);
    expect(req.request.method).toBe('POST');
    req.flush({ exitoso: true, datos: null });
  });

  it('SV-04 bandeja del docente por grupo', () => {
    service.solicitudesGrupo('grp-1', { estado: 'PENDIENTE', pagina: 1, tamano: 20 }).subscribe();
    const req = http.expectOne((r) => r.url === `${API}/docente/grupos/grp-1/solicitudes-ingreso`);
    expect(req.request.params.get('estado')).toBe('PENDIENTE');
    expect(req.request.params.get('tamano')).toBe('20');
    req.flush({ exitoso: true, datos: [], total: 0 });
  });

  it('SV-05 el docente acepta o rechaza con motivo', () => {
    service.resolver('sol-1', 'RECHAZAR', 'Cupo reservado').subscribe((res) => expect(res.datos?.estadoResultante).toBe('RECHAZADA'));
    const req = http.expectOne(`${API}/docente/solicitudes-ingreso/sol-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ accion: 'RECHAZAR', motivo: 'Cupo reservado' });
    req.flush({ exitoso: true, datos: { id: 'sol-1', estadoResultante: 'RECHAZADA' } });

    service.resolver('sol-2', 'ACEPTAR').subscribe();
    const aceptar = http.expectOne(`${API}/docente/solicitudes-ingreso/sol-2`);
    expect(aceptar.request.body).toEqual({ accion: 'ACEPTAR' });
    aceptar.flush({ exitoso: true, datos: { id: 'sol-2', estadoResultante: 'EN_ESPERA' } });
  });
});
