import { ClassSession } from './attendance.model';

describe('ClassSession contract', () => {
  it('compila con los campos reales del contrato frontend/backend de Sesion', () => {
    const session: ClassSession = {
      id: 'ses-1',
      courseId: 'grupo-1',
      sessionNumber: 1,
      title: 'Sesion contractual',
      date: '2026-09-23',
      startTime: '08:00',
      endTime: '10:00',
      records: [],
    };

    expect(session.title).toBe('Sesion contractual');
  });

  it('rechaza por tipo campos fantasma heredados de Sesion', () => {
    const base: ClassSession = {
      id: 'ses-1',
      courseId: 'grupo-1',
      sessionNumber: 1,
      title: 'Sesion contractual',
      date: '2026-09-23',
      startTime: '08:00',
      endTime: '10:00',
      records: [],
    };

    expect(base.records).toEqual([]);

    // @ts-expect-error topic no pertenece al contrato de Sesion.
    const withTopic: ClassSession = { ...base, topic: 'Tema fantasma' };
    // @ts-expect-error room pertenece al Grupo/Course, no a Sesion.
    const withRoom: ClassSession = { ...base, room: 'Aula fantasma' };
    // @ts-expect-error tipo no pertenece al contrato de Sesion.
    const withTipo: ClassSession = { ...base, tipo: 'REGULAR' };
    // @ts-expect-error status no pertenece al contrato de Sesion.
    const withStatus: ClassSession = { ...base, status: 'PROGRAMADA' };

    expect([withTopic, withRoom, withTipo, withStatus].map((session) => session.id)).toEqual([
      'ses-1',
      'ses-1',
      'ses-1',
      'ses-1',
    ]);
  });
});
