import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AttendanceRealtimeSyncService } from './attendance-realtime-sync.service';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import {
  AttendanceRegisteredRealtimePayload,
  RealtimeEvent,
} from '../../../core/realtime/model/realtime-event.model';

describe('AttendanceRealtimeSyncService', () => {
  let service: AttendanceRealtimeSyncService;
  let events$: Subject<RealtimeEvent<AttendanceRegisteredRealtimePayload>>;
  let realtimeServiceSpy: jasmine.SpyObj<RealtimeService>;

  beforeEach(() => {
    events$ = new Subject<RealtimeEvent<AttendanceRegisteredRealtimePayload>>();
    realtimeServiceSpy = jasmine.createSpyObj<RealtimeService>('RealtimeService', ['listenType']);
    realtimeServiceSpy.listenType.and.returnValue(events$.asObservable());

    TestBed.configureTestingModule({
      providers: [{ provide: RealtimeService, useValue: realtimeServiceSpy }],
    });

    service = TestBed.inject(AttendanceRealtimeSyncService);
  });

  function emit(grupo: string, sesion: string): void {
    events$.next({
      eventId: 'evt-' + Math.random(),
      type: 'ASISTENCIA_REGISTRADA',
      occurredAt: '2026-09-15T10:00:00Z',
      correlationId: null,
      payload: { estudiante: 'e1', grupo, sesion, presente: true },
    });
  }

  it('escucha ASISTENCIA_REGISTRADA en el RealtimeService', () => {
    service.watch(() => 'g1', () => 's1').subscribe();
    expect(realtimeServiceSpy.listenType).toHaveBeenCalledWith('ASISTENCIA_REGISTRADA');
  });

  it('emite cuando el evento coincide con el mismo grupo y la misma sesión', fakeAsync(() => {
    const received: unknown[] = [];
    service.watch(() => 'g1', () => 's1').subscribe((evt) => received.push(evt));

    emit('g1', 's1');
    tick(300);

    expect(received.length).toBe(1);
  }));

  it('no emite si el evento pertenece a la misma sesión pero otro grupo', fakeAsync(() => {
    const received: unknown[] = [];
    service.watch(() => 'g1', () => 's1').subscribe((evt) => received.push(evt));

    emit('g2', 's1');
    tick(300);

    expect(received.length).toBe(0);
  }));

  it('no emite si el evento pertenece al mismo grupo pero otra sesión', fakeAsync(() => {
    const received: unknown[] = [];
    service.watch(() => 'g1', () => 's1').subscribe((evt) => received.push(evt));

    emit('g1', 's2');
    tick(300);

    expect(received.length).toBe(0);
  }));

  it('coalesce varios eventos consecutivos del mismo grupo/sesión en una sola emisión', fakeAsync(() => {
    const received: unknown[] = [];
    service.watch(() => 'g1', () => 's1').subscribe((evt) => received.push(evt));

    emit('g1', 's1');
    emit('g1', 's1');
    emit('g1', 's1');
    tick(300);

    expect(received.length).toBe(1);
  }));

  it('no emite si no hay grupo o sesión seleccionados', fakeAsync(() => {
    const received: unknown[] = [];
    service.watch(() => '', () => '').subscribe((evt) => received.push(evt));

    emit('g1', 's1');
    tick(300);

    expect(received.length).toBe(0);
  }));
});
