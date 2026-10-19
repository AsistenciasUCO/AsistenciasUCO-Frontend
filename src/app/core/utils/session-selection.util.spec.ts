import { ClassSession } from '../models/attendance.model';
import { findActiveOrUpcomingSession } from './session-selection.util';

describe('findActiveOrUpcomingSession', () => {
  const createSession = (id: string, date: string, startTime: string, endTime: string, sessionNumber: number): ClassSession => ({
    id,
    courseId: 'grp-1',
    sessionNumber,
    title: `Sesión ${sessionNumber}`,
    date,
    startTime,
    endTime,
    records: [],
  });

  it('debe retornar undefined si la lista de sesiones es nula o vacía', () => {
    expect(findActiveOrUpcomingSession([])).toBeUndefined();
  });

  it('debe seleccionar la sesión en curso si la hora actual está dentro de su rango hoy', () => {
    const sessions: ClassSession[] = [
      createSession('ses-1', '2026-09-29', '08:00', '10:00', 1),
      createSession('ses-2', '2026-09-29', '10:00', '12:00', 2),
      createSession('ses-3', '2026-09-29', '14:00', '16:00', 3),
    ];

    const now = new Date(2026, 8, 29, 11, 0, 0); // 2026-09-29 11:00 AM (durante ses-2)
    const result = findActiveOrUpcomingSession(sessions, now);

    expect(result).toBeDefined();
    expect(result?.id).toBe('ses-2');
  });

  it('debe seleccionar la próxima sesión futura más cercana si ninguna está en curso', () => {
    const sessions: ClassSession[] = [
      createSession('ses-1', '2026-09-28', '08:00', '10:00', 1),
      createSession('ses-2', '2026-09-30', '08:00', '10:00', 2),
      createSession('ses-3', '2026-10-05', '08:00', '10:00', 3),
    ];

    const now = new Date(2026, 8, 29, 14, 0, 0); // 2026-09-29 14:00 (después de ses-1, antes de ses-2)
    const result = findActiveOrUpcomingSession(sessions, now);

    expect(result).toBeDefined();
    expect(result?.id).toBe('ses-2');
  });

  it('debe seleccionar la última sesión completada más reciente si todas ya concluyeron', () => {
    const sessions: ClassSession[] = [
      createSession('ses-1', '2026-09-10', '08:00', '10:00', 1),
      createSession('ses-2', '2026-09-17', '08:00', '10:00', 2),
      createSession('ses-3', '2026-09-24', '08:00', '10:00', 3),
    ];

    const now = new Date(2026, 8, 29, 14, 0, 0); // 2026-09-29 (todas ya pasaron)
    const result = findActiveOrUpcomingSession(sessions, now);

    expect(result).toBeDefined();
    expect(result?.id).toBe('ses-3');
  });
});
