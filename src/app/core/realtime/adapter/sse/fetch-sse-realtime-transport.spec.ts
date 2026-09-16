import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { FetchSseRealtimeTransport } from './fetch-sse-realtime-transport';
import { SSE_FETCH_EVENT_SOURCE, FetchEventSourceFn } from './sse-fetch-event-source.token';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../../environments/environment';
import { RealtimeEvent } from '../../model/realtime-event.model';
import { RealtimeConnectionState } from '../../model/realtime-connection-state.model';

interface RecordedCall {
  input: RequestInfo;
  init: FetchEventSourceInit;
  resolve: () => void;
  reject: (err: unknown) => void;
}

function createFakeFetchEventSource(): { fn: FetchEventSourceFn; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const fn: FetchEventSourceFn = (input, init) => {
    return new Promise<void>((resolve, reject) => {
      calls.push({ input, init, resolve, reject });
    });
  };
  return { fn, calls };
}

function fakeResponse(status: number, contentType = ''): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(contentType ? { 'content-type': contentType } : {}),
  } as Response;
}

/** Replica cómo la librería real encadena onopen -> onerror -> reject. */
async function openWith(call: RecordedCall, response: Response): Promise<void> {
  try {
    await call.init.onopen!(response);
  } catch (err) {
    try {
      call.init.onerror?.(err);
      // Si onerror no relanza (no es nuestro caso), no rechazamos.
    } catch (rethrown) {
      call.reject(rethrown);
    }
  }
}

function flushAsync(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function validEvent(overrides: Partial<RealtimeEvent> = {}): RealtimeEvent {
  return {
    eventId: 'evt-1',
    type: 'ASISTENCIAS_SESION_ACTUALIZADAS',
    occurredAt: '2026-09-15T10:00:00Z',
    correlationId: null,
    payload: { grupo: 'g1', sesion: 's1', totalRegistros: 1 },
    ...overrides,
  };
}

describe('FetchSseRealtimeTransport', () => {
  let transport: FetchSseRealtimeTransport;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let fake: { fn: FetchEventSourceFn; calls: RecordedCall[] };

  function setup(): void {
    fake = createFakeFetchEventSource();
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getValidAccessToken',
      'refreshAccessToken',
    ]);
    authServiceSpy.getValidAccessToken.and.resolveTo('token-abc');
    authServiceSpy.refreshAccessToken.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        FetchSseRealtimeTransport,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SSE_FETCH_EVENT_SOURCE, useValue: fake.fn },
      ],
    });

    transport = TestBed.inject(FetchSseRealtimeTransport);
  }

  afterEach(() => {
    transport.stop();
  });

  it('construye la URL /realtime/stream correcta', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();

    expect(fake.calls.length).toBe(1);
    expect(fake.calls[0].input).toBe(
      `${environment.apiUrl}/realtime/stream?grupoId=g1`
    );
  });

  it('nunca agrega el token como query param', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();

    const url = String(fake.calls[0].input);
    expect(url).not.toContain('token-abc');
    expect(url).toContain('?grupoId=g1');
  });

  it('envía el header Authorization Bearer correcto', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();

    expect(fake.calls[0].init.headers?.['Authorization']).toBe('Bearer token-abc');
  });

  it('envía X-Correlation-Id y credentials: omit', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();

    expect(fake.calls[0].init.headers?.['X-Correlation-Id']).toBeTruthy();
    expect(fake.calls[0].init.credentials).toBe('omit');
  });

  it('en modo mock no conecta', async () => {
    setup();
    spyOnProperty(environment, 'useMocks', 'get').and.returnValue(true);

    transport.start({ grupoId: 'g1' });
    await flushAsync();

    expect(fake.calls.length).toBe(0);
  });

  it('sin token disponible no conecta', async () => {
    setup();
    authServiceSpy.getValidAccessToken.and.resolveTo(null);

    transport.start({ grupoId: 'g1' });
    await flushAsync();

    expect(fake.calls.length).toBe(0);
  });

  it('conexión exitosa emite el estado CONNECTED', async () => {
    setup();
    const states: RealtimeConnectionState[] = [];
    transport.connectionState$.subscribe((s) => states.push(s));

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    await openWith(fake.calls[0], fakeResponse(200, 'text/event-stream'));
    await flushAsync();

    expect(states).toContain('CONNECTED');
  });

  it('un evento válido se emite en events$', async () => {
    setup();
    const received: RealtimeEvent[] = [];
    transport.events$.subscribe((evt) => received.push(evt));

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const call = fake.calls[0];
    await openWith(call, fakeResponse(200, 'text/event-stream'));

    const evt = validEvent();
    call.init.onmessage?.({
      id: evt.eventId,
      event: evt.type,
      data: JSON.stringify(evt),
    });

    expect(received.length).toBe(1);
    expect(received[0]).toEqual(evt);
  });

  it('un payload inválido se descarta sin romper el stream', async () => {
    setup();
    const received: RealtimeEvent[] = [];
    transport.events$.subscribe((evt) => received.push(evt));
    spyOn(console, 'warn');

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const call = fake.calls[0];
    await openWith(call, fakeResponse(200, 'text/event-stream'));

    call.init.onmessage?.({ id: '1', event: 'ASISTENCIAS_SESION_ACTUALIZADAS', data: 'not-json{{' });
    call.init.onmessage?.({ id: '2', event: 'ASISTENCIAS_SESION_ACTUALIZADAS', data: JSON.stringify({ foo: 'bar' }) });

    expect(received.length).toBe(0);
    expect(console.warn).toHaveBeenCalled();
  });

  it('un mensaje sin campo data (heartbeat) no se convierte en evento', async () => {
    setup();
    const received: RealtimeEvent[] = [];
    transport.events$.subscribe((evt) => received.push(evt));

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const call = fake.calls[0];
    await openWith(call, fakeResponse(200, 'text/event-stream'));

    call.init.onmessage?.({ id: '', event: '', data: '' });

    expect(received.length).toBe(0);
  });

  it('event SSE y data.type inconsistentes se descartan', async () => {
    setup();
    const received: RealtimeEvent[] = [];
    transport.events$.subscribe((evt) => received.push(evt));
    spyOn(console, 'warn');

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const call = fake.calls[0];
    await openWith(call, fakeResponse(200, 'text/event-stream'));

    const evt = validEvent();
    call.init.onmessage?.({
      id: evt.eventId,
      event: 'OTRO_TIPO',
      data: JSON.stringify(evt),
    });

    expect(received.length).toBe(0);
    expect(console.warn).toHaveBeenCalled();
  });

  it('stop() aborta el transporte', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const call = fake.calls[0];

    transport.stop();

    expect(call.init.signal?.aborted).toBeTrue();
  });

  it('stop() no deja temporizadores de reconexión pendientes', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const call = fake.calls[0];

    transport.stop();
    call.reject(new TypeError('network error'));
    await flushAsync();

    const callsAfterStop = fake.calls.length;
    // Si quedara un timer de reconexión vivo, dispararía una nueva llamada.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fake.calls.length).toBe(callsAfterStop);
  });

  it('un fallo de red pasa a RECONNECTING', async () => {
    setup();
    const states: RealtimeConnectionState[] = [];
    transport.connectionState$.subscribe((s) => states.push(s));

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    fake.calls[0].reject(new TypeError('network error'));
    await flushAsync();

    expect(states).toContain('RECONNECTING');
  });

  it('401 intenta refrescar el token una vez y reconecta', async () => {
    setup();
    authServiceSpy.getValidAccessToken.and.resolveTo('token-old');
    authServiceSpy.refreshAccessToken.and.callFake(async () => {
      authServiceSpy.getValidAccessToken.and.resolveTo('token-new');
      return true;
    });

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    await openWith(fake.calls[0], fakeResponse(401));
    await flushAsync();
    await flushAsync();

    expect(authServiceSpy.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fake.calls.length).toBe(2);
    expect(fake.calls[1].init.headers?.['Authorization']).toBe('Bearer token-new');
  });

  it('401 con refresh fallido termina en UNAUTHORIZED sin loop infinito', async () => {
    setup();
    authServiceSpy.refreshAccessToken.and.resolveTo(false);
    const states: RealtimeConnectionState[] = [];
    transport.connectionState$.subscribe((s) => states.push(s));

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    await openWith(fake.calls[0], fakeResponse(401));
    await flushAsync();
    await flushAsync();

    expect(states).toContain('UNAUTHORIZED');
    expect(authServiceSpy.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fake.calls.length).toBe(1);
  });

  it('403 es un error terminal, sin reintentos', async () => {
    setup();
    const states: RealtimeConnectionState[] = [];
    transport.connectionState$.subscribe((s) => states.push(s));

    transport.start({ grupoId: 'g1' });
    await flushAsync();
    await openWith(fake.calls[0], fakeResponse(403));
    await flushAsync();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(states).toContain('ERROR');
    expect(fake.calls.length).toBe(1);
  });

  it('start() es idempotente: no abre dos streams simultáneos', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    transport.start({ grupoId: 'g1' });
    await flushAsync();

    expect(fake.calls.length).toBe(1);
  });

  it('cambiar de grupo aborta el stream anterior y abre el nuevo scope', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const previousCall = fake.calls[0];

    transport.start({ grupoId: 'g2' });
    await flushAsync();

    expect(previousCall.init.signal?.aborted).toBeTrue();
    expect(fake.calls.length).toBe(2);
    expect(fake.calls[1].input).toBe(
      `${environment.apiUrl}/realtime/stream?grupoId=g2`
    );
  });

  it('el loop abortado de otro grupo no vuelve a reconectar', async () => {
    setup();
    transport.start({ grupoId: 'g1' });
    await flushAsync();
    const previousCall = fake.calls[0];

    transport.start({ grupoId: 'g2' });
    await flushAsync();
    previousCall.resolve();
    await flushAsync();

    expect(fake.calls.length).toBe(2);
  });
});
