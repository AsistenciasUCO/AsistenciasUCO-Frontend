import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';

describe('SessionService', () => {
  let service: SessionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta exclusivamente GET /sesiones/grupo/{grupo}', () => {
    let sessionId = '';
    service
      .getSessionsByGroup('grupo-1')
      .subscribe((response) => (sessionId = response.datos[0].id));

    const request = http.expectOne(
      `${environment.apiUrl}/sesiones/grupo/grupo-1`
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      exitoso: true,
      total: 1,
      datos: [
        {
          sesion: 'ses-1',
          grupo: 'grupo-1',
          nombre: 'Sesión 1',
          numero: 1,
          codigo: 'S1',
          numeroSemana: 1,
          codigoGrupo: 'G1',
          nombreGrupo: 'Grupo 1',
          fechaHoraInicio: '2026-09-16T08:00:00',
          fechaHoraFin: '2026-09-16T10:00:00',
        },
      ],
    });

    expect(sessionId).toBe('ses-1');
  });

  it('propaga el error del GET sin invocar POST /sesiones/consultas', () => {
    let receivedError: unknown;
    service
      .getSessionsByGroup('grupo-1')
      .subscribe({ error: (error) => (receivedError = error) });

    http
      .expectOne(`${environment.apiUrl}/sesiones/grupo/grupo-1`)
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(receivedError).toBeTruthy();
    http.expectNone(`${environment.apiUrl}/sesiones/consultas`);
  });
});
