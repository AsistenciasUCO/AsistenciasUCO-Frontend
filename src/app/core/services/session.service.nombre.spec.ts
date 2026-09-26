import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

describe('SessionService nombre 1..50 (no depende del rechazo del backend)', () => {
  let service: SessionService;
  let http: HttpTestingController;
  const base = { date: '2026-09-23', startTime: '08:00', endTime: '10:00' };

  beforeEach(() => {
    localStorage.setItem('USE_MOCKS', 'false');
    TestBed.configureTestingModule({
      providers: [SessionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('USE_MOCKS');
  });

  it('create con 50 caracteres envía exactamente {grupo,nombre,fechaHoraInicio,fechaHoraFin}', () => {
    const nombre = 'x'.repeat(50);
    service.createSession('g1', { title: nombre, ...base }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/sesiones`);
    expect(Object.keys(req.request.body).sort()).toEqual(
      ['fechaHoraFin', 'fechaHoraInicio', 'grupo', 'nombre']
    );
    expect(req.request.body.nombre).toBe(nombre);
    req.flush({ exitoso: true, mensaje: 'ok' });
  });

  it('create con 51 caracteres falla localmente y NO llama al backend', () => {
    let error: unknown;
    service.createSession('g1', { title: 'x'.repeat(51), ...base }).subscribe({
      error: (e) => (error = e),
    });
    expect(error).toEqual(jasmine.any(Error));
    http.expectNone(`${environment.apiUrl}/sesiones`);
  });

  it('create con nombre vacío falla localmente', () => {
    let error: unknown;
    service.createSession('g1', { title: '   ', ...base }).subscribe({
      error: (e) => (error = e),
    });
    expect(error).toEqual(jasmine.any(Error));
    http.expectNone(`${environment.apiUrl}/sesiones`);
  });

  it('update con 50 caracteres envía exactamente {nombre,fechaHoraInicio,fechaHoraFin}', () => {
    service.updateSession('g1', 's1', { title: 'x'.repeat(50), ...base }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/sesiones/s1`);
    expect(Object.keys(req.request.body).sort()).toEqual(
      ['fechaHoraFin', 'fechaHoraInicio', 'nombre']
    );
    req.flush({ exitoso: true, datos: null });
  });

  it('update con 51 caracteres falla localmente y NO llama al backend', () => {
    let error: unknown;
    service.updateSession('g1', 's1', { title: 'x'.repeat(51), ...base }).subscribe({
      error: (e) => (error = e),
    });
    expect(error).toEqual(jasmine.any(Error));
    http.expectNone(`${environment.apiUrl}/sesiones/s1`);
  });
});
