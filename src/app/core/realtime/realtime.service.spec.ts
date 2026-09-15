import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { REALTIME_TRANSPORT, RealtimeTransport } from './contract/realtime-transport';
import { RealtimeEvent } from './model/realtime-event.model';
import { RealtimeConnectionState } from './model/realtime-connection-state.model';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let events$: Subject<RealtimeEvent>;
  let state$: Subject<RealtimeConnectionState>;
  let transportSpy: jasmine.SpyObj<RealtimeTransport>;

  beforeEach(() => {
    events$ = new Subject<RealtimeEvent>();
    state$ = new Subject<RealtimeConnectionState>();
    transportSpy = jasmine.createSpyObj<RealtimeTransport>(
      'RealtimeTransport',
      ['start', 'stop'],
      { events$: events$.asObservable(), connectionState$: state$.asObservable() }
    );

    TestBed.configureTestingModule({
      providers: [{ provide: REALTIME_TRANSPORT, useValue: transportSpy }],
    });

    service = TestBed.inject(RealtimeService);
  });

  function makeEvent(type: string, payload: unknown = {}): RealtimeEvent {
    return {
      eventId: 'evt-' + Math.random(),
      type,
      occurredAt: '2026-09-15T10:00:00Z',
      correlationId: null,
      payload,
    };
  }

  it('start() delega en el transporte', () => {
    service.start();
    expect(transportSpy.start).toHaveBeenCalledTimes(1);
  });

  it('stop() delega en el transporte', () => {
    service.stop();
    expect(transportSpy.stop).toHaveBeenCalledTimes(1);
  });

  it('listenType entrega solo eventos del tipo solicitado', () => {
    const received: RealtimeEvent[] = [];
    service.listenType('ASISTENCIA_REGISTRADA').subscribe((evt) => received.push(evt));

    events$.next(makeEvent('OTRO_TIPO'));
    events$.next(makeEvent('ASISTENCIA_REGISTRADA'));
    events$.next(makeEvent('OTRO_TIPO'));

    expect(received.length).toBe(1);
    expect(received[0].type).toBe('ASISTENCIA_REGISTRADA');
  });

  it('soporta múltiples subscribers independientes', () => {
    const a: RealtimeEvent[] = [];
    const b: RealtimeEvent[] = [];
    service.listenType('ASISTENCIA_REGISTRADA').subscribe((evt) => a.push(evt));
    service.events().subscribe((evt) => b.push(evt));

    events$.next(makeEvent('ASISTENCIA_REGISTRADA'));
    events$.next(makeEvent('OTRO_TIPO'));

    expect(a.length).toBe(1);
    expect(b.length).toBe(2);
  });

  it('expone connectionState$ del transporte', () => {
    const states: RealtimeConnectionState[] = [];
    service.connectionState$.subscribe((s) => states.push(s));

    state$.next('CONNECTING');
    state$.next('CONNECTED');

    expect(states).toEqual(['CONNECTING', 'CONNECTED']);
  });
});
