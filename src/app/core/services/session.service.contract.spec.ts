import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

describe('SessionService contract operations', () => {
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

  it('rechaza LocalDateTime que no cumple el formato explícito', () => {
    let receivedError: unknown;
    service.getSessionsByGroup('grupo-1').subscribe({
      error: (error) => (receivedError = error),
    });

    http.expectOne(`${environment.apiUrl}/sesiones/grupo/grupo-1`).flush({
      exitoso: true,
      datos: [{
        sesion: 'ses-1',
        grupo: 'grupo-1',
        nombre: 'Sesión',
        numero: 1,
        fechaHoraInicio: 'fecha-inválida',
        fechaHoraFin: '2026-09-22T10:00:00',
      }],
    });

    expect(receivedError).toEqual(jasmine.any(Error));
  });

  it('crea una sesión serializando LocalDateTime sin conversión de zona ni parámetros fantasma', () => {
    // TARGET (PLAN.md LB-001B.1B, AS-IS #5): createSession() deja de aceptar/enviar
    // topic/room/tipo — descripcion/aula/tipo eran ghost parameters que usp_crear_sesion
    // acepta y descarta (confirmado por el PLAN.md del backend LB-001B.1). El body real
    // enviado a POST /sesiones debe limitarse exactamente a los campos persistidos por el SP.
    let response: unknown;
    service.createSession('grupo-1', {
      title: 'Sesión local',
      date: '2026-09-22',
      startTime: '08:00',
      endTime: '10:00',
    } as any).subscribe((value) => (response = value));

    const request = http.expectOne(`${environment.apiUrl}/sesiones`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      grupo: 'grupo-1',
      nombre: 'Sesión local',
      fechaHoraInicio: '2026-09-22T08:00:00',
      fechaHoraFin: '2026-09-22T10:00:00',
    });
    expect(request.request.body.descripcion).toBeUndefined();
    expect(request.request.body.aula).toBeUndefined();
    expect(request.request.body.tipo).toBeUndefined();
    request.flush({ exitoso: true, mensaje: 'creada' });
    expect(response).toEqual({ exitoso: true, mensaje: 'creada' });
  });

  it('actualiza una sesión con el payload HTTP exacto del backend, sin campos UI ni fantasma', () => {
    let response: any;
    service.updateSession('grupo-1', 'ses-1', {
      title: 'Sesión editada',
      date: '2026-09-23',
      startTime: '09:15',
      endTime: '11:45',
    })
      .subscribe((value) => (response = value));

    const request = http.expectOne(`${environment.apiUrl}/sesiones/ses-1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      nombre: 'Sesión editada',
      fechaHoraInicio: '2026-09-23T09:15:00',
      fechaHoraFin: '2026-09-23T11:45:00',
    });
    for (const ghostField of [
      'room',
      'aula',
      'topic',
      'descripcion',
      'tipo',
      'status',
      'title',
      'date',
      'startTime',
      'endTime',
    ]) {
      expect(request.request.body[ghostField]).toBeUndefined();
    }
    // BACKEND_GOLDEN_PATH_CONTRACT §C.8: ApiDataResponse<Void> = { exitoso: true, datos: null }.
    request.flush({ exitoso: true, datos: null });

    expect(response).toEqual({ exitoso: true, datos: null });
    expect(response.datos).toBeNull();
    expect('idTransaccion' in response).toBeFalse();
    expect('mensajeUsuario' in response).toBeFalse();
  });

  it('LB-001C.2B: PATCH /sesiones/{id} sin fallback PUT (ni en éxito ni en fallo)', () => {
    const isSessionPut = (r: { method: string; url: string }) =>
      r.method === 'PUT' && /\/sesiones\/[^/]+$/.test(r.url);
    const input = { title: 'Editada', date: '2026-09-23', startTime: '09:00', endTime: '11:00' };

    service.updateSession('grupo-1', 'ses-1', input).subscribe();
    http.expectOne((r) => r.method === 'PATCH' && r.url === `${environment.apiUrl}/sesiones/ses-1`)
      .flush({ exitoso: true, datos: null });

    let failed = false;
    service.updateSession('grupo-1', 'ses-2', input).subscribe({ error: () => (failed = true) });
    http.expectOne((r) => r.method === 'PATCH' && r.url === `${environment.apiUrl}/sesiones/ses-2`)
      .flush({ codigo: 'X' }, { status: 500, statusText: 'Server Error' });

    expect(failed).toBeTrue();
    expect(http.match(isSessionPut).length).toBe(0);
  });

  it('el tipo de updateSession es ApiDataResponse<null>, no ApiResponse<ClassSession>', () => {
    const observable = service.updateSession('grupo-1', 'ses-1', {
      title: 'x',
      date: '2026-09-23',
      startTime: '09:00',
      endTime: '10:00',
    });
    observable.subscribe((value) => {
      // Compila solo si `datos` es exactamente `null` (no una ClassSession).
      const datos: null = value.datos;
      expect(datos).toBeNull();
    });
    http.expectOne(`${environment.apiUrl}/sesiones/ses-1`).flush({ exitoso: true, datos: null });
  });

  it('rechaza por diseño de tipos datos fantasma al actualizar sesión', () => {
    // @ts-expect-error room pertenece al contrato de Grupo/Course, no al input de actualizar Sesion.
    service.updateSession('grupo-1', 'ses-1', { room: 'B-202' });
    // @ts-expect-error topic/descripcion no forman parte del contrato persistido de Sesion.
    service.updateSession('grupo-1', 'ses-1', { topic: 'Tema libre' });
    // @ts-expect-error status no existe en el contrato backend de Sesion.
    service.updateSession('grupo-1', 'ses-1', { status: 'CONCLUIDA' });
    expect(service).toBeTruthy();
  });

  it('cierra la sesión con el endpoint contractual', () => {
    let response: any;
    service.closeSession('ses-1').subscribe((value) => (response = value));

    const request = http.expectOne(`${environment.apiUrl}/sesiones/cierres`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ sesion: 'ses-1' });
    request.flush({ exitoso: true });

    expect(response.mensajeUsuario).toContain('consolidada');
    expect(response.datos).toBeUndefined();
  });

  it('cancela la sesión y conserva la respuesta de negocio', () => {
    let response: any;
    service.cancelarSesion('ses-1', 'Fuerza mayor')
      .subscribe((value) => (response = value));

    const request = http.expectOne(
      `${environment.apiUrl}/docente/sesiones/ses-1/cancelar`
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ motivo: 'Fuerza mayor' });
    request.flush({
      idTransaccion: 'tx-1',
      mensajeUsuario: 'Cancelada',
      datos: { estado: 'CANCELADA' },
    });

    expect(response).toEqual(jasmine.objectContaining({
      idTransaccion: 'tx-1',
      exitoso: true,
      mensajeUsuario: 'Cancelada',
    }));
  });

  it('convierte un fallo de cancelación en respuesta controlada', () => {
    let response: any;
    service.cancelarSesion('ses-1', 'Motivo')
      .subscribe((value) => (response = value));

    http.expectOne(`${environment.apiUrl}/docente/sesiones/ses-1/cancelar`)
      .flush('fallo', { status: 500, statusText: 'Server Error' });

    expect(response.exitoso).toBeFalse();
    expect(response.datos).toBeUndefined();
  });

  it('obtiene el token QR y completa el mensaje', () => {
    let response: any;
    service.getQrToken('ses-1').subscribe((value) => (response = value));

    const request = http.expectOne(`${environment.apiUrl}/sesiones/ses-1/qr-token`);
    request.flush({
      exitoso: true,
      datos: {
        sesionId: 'ses-1',
        grupoId: 'grupo-1',
        token: 'token',
        codigoAcceso: '123456',
        expiraEnSegundos: 60,
        expiraEn: '2026-09-22T10:01:00',
      },
    });

    expect(response.idTransaccion).toBe('tx-qr-token');
    expect(response.mensajeUsuario).toBe('Token generado con éxito.');
  });

  it('registra autoasistencia y normaliza una respuesta exitosa', () => {
    let response: any;
    service.registrarAutoAsistencia({ codigoAcceso: '123456' })
      .subscribe((value) => (response = value));

    const request = http.expectOne(`${environment.apiUrl}/estudiante/asistencia-qr`);
    expect(request.request.body).toEqual({ codigoAcceso: '123456' });
    request.flush({ exitoso: true, datos: { registrada: true } });

    expect(response.idTransaccion).toBe('tx-auto-asistencia');
    expect(response.mensajeUsuario).toContain('registrada');
  });

  it('propaga el mensaje útil de un fallo de autoasistencia', () => {
    let receivedError: Error | undefined;
    service.registrarAutoAsistencia({ token: 'vencido' }).subscribe({
      error: (error) => (receivedError = error),
    });

    http.expectOne(`${environment.apiUrl}/estudiante/asistencia-qr`)
      .flush({ message: 'El token expiró' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedError?.message).toBe('El token expiró');
  });
});
