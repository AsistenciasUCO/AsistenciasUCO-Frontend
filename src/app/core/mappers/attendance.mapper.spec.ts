import { AttendanceMapper } from './attendance.mapper';
import { EstudianteGrupoApiDto } from '../api/models/estudiante-grupo-api-dto.model';
import { AsistenciaConsultadaApiDto } from '../api/models/asistencia-consultada-api-dto.model';

describe('AttendanceMapper', () => {
  const student: EstudianteGrupoApiDto = {
    id: 'matricula-1',
    idEstudiante: 'estudiante-1',
    documento: '123456',
    nombreCompleto: 'Ada Lovelace',
    correo: 'ada@example.com',
    codigoEstado: 'ACT',
    nombreEstado: 'Activo',
  };

  function attendance(
    estado: 'AN' | 'SJC' | 'EX',
    presente: boolean | null = estado === 'AN'
  ): AsistenciaConsultadaApiDto {
    return {
      asistencia: 'asistencia-1',
      estudiante: student.idEstudiante,
      grupo: 'grupo-1',
      sesion: 'sesion-1',
      presente,
      estado,
      observacion: null,
    };
  }

  it('usa idEstudiante y documento, nunca el id de matrícula', () => {
    const [mapped] = AttendanceMapper.fromGroupStudentsAndAttendances(
      [student],
      []
    );

    expect(mapped.studentId).toBe('estudiante-1');
    expect(mapped.studentId).not.toBe('matricula-1');
    expect(mapped.studentCode).toBe('123456');
  });

  for (const status of ['AN', 'SJC', 'EX'] as const) {
    it(`conserva el estado ${status}`, () => {
      const [mapped] = AttendanceMapper.fromGroupStudentsAndAttendances(
        [student],
        [attendance(status)]
      );
      expect(mapped.status).toBe(status);
    });
  }

  it('conserva EX aunque presente sea false', () => {
    const [mapped] = AttendanceMapper.fromGroupStudentsAndAttendances(
      [student],
      [attendance('EX', false)]
    );
    expect(mapped.status).toBe('EX');
  });

  it('usa AN solo cuando no existe asistencia', () => {
    const [mapped] = AttendanceMapper.fromGroupStudentsAndAttendances(
      [student],
      []
    );
    expect(mapped.status).toBe('AN');
  });

  it('rechaza un estado fuera del contrato sin reconstruirlo desde presente', () => {
    const invalid = {
      ...attendance('EX', false),
      estado: 'LEGACY',
    } as unknown as AsistenciaConsultadaApiDto;

    expect(() =>
      AttendanceMapper.fromGroupStudentsAndAttendances([student], [invalid])
    ).toThrowError(/Estado de asistencia no soportado/);
  });
});
