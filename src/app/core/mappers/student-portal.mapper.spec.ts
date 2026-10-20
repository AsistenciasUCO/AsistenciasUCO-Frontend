import {
  HorarioEstudianteApiDto,
  MateriaEstudianteApiDto,
  SesionMateriaEstudianteApiDto,
} from '../api/models/estudiante-portal-api-dto.model';
import {
  NO_INFORMADO,
  StudentPortalMapper,
  normalizeDia,
  normalizeLocalTime,
} from './student-portal.mapper';

const ASIGNATURA = 'e2f3a4b5-0000-0000-0000-000000000001';
const GRUPO = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
const GRUPO_2 = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6e';

describe('StudentPortalMapper', () => {
  describe('materias (MateriaEstudianteDTO real)', () => {
    const dto: MateriaEstudianteApiDto = {
      idAsignatura: ASIGNATURA,
      nombreAsignatura: 'Arquitectura de Software',
      idGrupo: GRUPO,
      nombreGrupo: 'Grupo 001 - Arq Software',
    };

    it('mapea idAsignatura -> id, nombreAsignatura -> nombre, y conserva idGrupo/nombreGrupo por separado', () => {
      const materia = StudentPortalMapper.toMateria(dto)!;
      expect(materia.id).toBe(ASIGNATURA);
      expect(materia.nombre).toBe('Arquitectura de Software');
      expect(materia.idGrupo).toBe(GRUPO);
      expect(materia.grupo).toBe('Grupo 001 - Arq Software');
      expect(materia.claveGrupo).toBe(`${ASIGNATURA}:${GRUPO}`);
    });

    it('no inventa codigo, docente, aula, horario, creditos ni indicadores de asistencia', () => {
      const materia = StudentPortalMapper.toMateria(dto)!;
      expect(materia.codigo).toBeNull();
      expect(materia.docente).toBeNull();
      expect(materia.aula).toBeNull();
      expect(materia.horario).toBeNull();
      expect(materia.creditos).toBeNull();
      expect(materia.indicadores).toBeNull();
      expect(materia.estado).toBeNull();
      expect(JSON.stringify(materia)).not.toContain('NaN');
    });

    it('varios grupos de una misma asignatura producen identidades compuestas distintas', () => {
      const materias = StudentPortalMapper.toMaterias([
        dto,
        { ...dto, idGrupo: GRUPO_2, nombreGrupo: 'Grupo 002' },
      ]);
      expect(materias.length).toBe(2);
      expect(materias[0].id).toBe(materias[1].id);
      expect(new Set(materias.map((m) => m.claveGrupo)).size).toBe(2);
    });

    it('descarta filas sin UUID valido para que ninguna ruta se arme con undefined', () => {
      const materias = StudentPortalMapper.toMaterias([
        { ...dto, idAsignatura: undefined as unknown as string },
        { ...dto, idAsignatura: 'undefined' },
        { ...dto, idGrupo: '' },
        dto,
      ]);
      expect(materias.length).toBe(1);
      expect(materias[0].id).toBe(ASIGNATURA);
    });

    it('usa un texto honesto cuando falta el nombre', () => {
      const materia = StudentPortalMapper.toMateria({ ...dto, nombreAsignatura: '  ', nombreGrupo: '' })!;
      expect(materia.nombre).toBe(NO_INFORMADO);
      expect(materia.grupo).toBe(NO_INFORMADO);
    });

    it('tolera una respuesta sin datos', () => {
      expect(StudentPortalMapper.toMaterias(undefined)).toEqual([]);
      expect(StudentPortalMapper.toMaterias(null)).toEqual([]);
    });
  });

  describe('horarios (HorarioEstudianteDTO real)', () => {
    const dto: HorarioEstudianteApiDto = {
      id: 'b1b2b3b4-0000-4000-8000-000000000001',
      idEstudiante: 'c1c2c3c4-0000-4000-8000-000000000001',
      idGrupo: GRUPO,
      codigoMateria: 'ARQ-01',
      nombreMateria: 'Arquitectura de Software',
      grupo: 'G1',
      dia: 'MIERCOLES',
      horaInicio: '08:00:00',
      horaFin: '10:00:00',
      docente: 'Ana Gómez',
    };

    it('normaliza dia (con o sin tilde, cualquier capitalizacion) y horas a HH:mm', () => {
      const h = StudentPortalMapper.toHorario(dto)!;
      expect(h.dia).toBe('Miércoles');
      expect(h.horaInicio).toBe('08:00');
      expect(h.horaFin).toBe('10:00');
      expect(h.docente).toBe('Ana Gómez');
      expect(h.aula).toBeNull();
    });

    it('reconoce el sabado y las demas variantes de dia', () => {
      expect(normalizeDia('SABADO')).toBe('Sábado');
      expect(normalizeDia('Sábado')).toBe('Sábado');
      expect(normalizeDia('lunes')).toBe('Lunes');
      expect(normalizeDia('DOMINGO')).toBeNull();
      expect(normalizeDia(undefined)).toBeNull();
    });

    it('acepta LocalTime como texto con o sin segundos y como arreglo [h, m]', () => {
      expect(normalizeLocalTime('08:00')).toBe('08:00');
      expect(normalizeLocalTime('14:30:00')).toBe('14:30');
      expect(normalizeLocalTime([7, 5])).toBe('07:05');
      expect(normalizeLocalTime('25:00')).toBeNull();
      expect(normalizeLocalTime('abc')).toBeNull();
      expect(normalizeLocalTime(null)).toBeNull();
    });

    it('descarta filas con dia u hora irreconocibles en vez de inventarlos', () => {
      const horarios = StudentPortalMapper.toHorarios([
        dto,
        { ...dto, id: 'b1b2b3b4-0000-4000-8000-000000000002', dia: 'DOMINGO' },
        { ...dto, id: 'b1b2b3b4-0000-4000-8000-000000000003', horaInicio: 'x' },
      ]);
      expect(horarios.length).toBe(1);
    });

    it('un docente vacio queda null (no se inventa)', () => {
      expect(StudentPortalMapper.toHorario({ ...dto, docente: ' ' })!.docente).toBeNull();
    });
  });

  describe('sesiones (SesionMateriaEstudianteDTO real)', () => {
    const formato = (utc: string) => ({ date: utc.slice(0, 10), time: utc.slice(11, 16) });
    const dto: SesionMateriaEstudianteApiDto = {
      id: 'd1d2d3d4-0000-4000-8000-000000000001',
      nombre: 'Introducción',
      numero: 1,
      codigo: 'SES-01',
      numeroSemana: 1,
      idGrupo: GRUPO,
      codigoGrupo: 'G1',
      nombreGrupo: 'Grupo 001',
      fechaHoraInicio: '2026-10-19T13:00:00Z',
      fechaHoraFin: '2026-10-19T15:00:00Z',
    };

    it('con instante UTC explicito lo presenta con el formateador de zona y conserva el instante', () => {
      const s = StudentPortalMapper.toSesion(dto, ASIGNATURA, formato)!;
      expect(s.temporalidad).toBe('UTC');
      expect(s.fechaHoraInicioUtc).toBe('2026-10-19T13:00:00Z');
      expect(s.fecha).toBe('2026-10-19');
      expect(s.horario).toBe('13:00 - 15:00');
      expect(s.materiaId).toBe(ASIGNATURA);
      expect(s.grupoId).toBe(GRUPO);
      expect(s.tema).toBe('Introducción');
      expect(s.numeroSesion).toBe(1);
    });

    it('convierte un offset a UTC antes de formatear', () => {
      const s = StudentPortalMapper.toSesion(
        { ...dto, fechaHoraInicio: '2026-10-19T08:00:00-05:00', fechaHoraFin: '2026-10-19T10:00:00-05:00' },
        ASIGNATURA,
        formato
      )!;
      expect(s.fechaHoraInicioUtc).toBe('2026-10-19T13:00:00Z');
      expect(s.horario).toBe('13:00 - 15:00');
    });

    it('una hora sin zona (LocalDateTime actual) NO se reinterpreta: se muestra tal cual y se marca SIN_ZONA', () => {
      const s = StudentPortalMapper.toSesion(
        { ...dto, fechaHoraInicio: '2026-10-19T13:00:00', fechaHoraFin: '2026-10-19T15:00:00' },
        ASIGNATURA,
        () => {
          throw new Error('no debe formatear instantes sin zona');
        }
      )!;
      expect(s.temporalidad).toBe('SIN_ZONA');
      expect(s.fechaHoraInicioUtc).toBeUndefined();
      expect(s.fecha).toBe('2026-10-19');
      expect(s.horario).toBe('13:00 - 15:00');
    });

    it('sin fecha valida muestra "No informado" y no revienta', () => {
      const s = StudentPortalMapper.toSesion({ ...dto, fechaHoraInicio: 'basura', fechaHoraFin: '' }, ASIGNATURA, formato)!;
      expect(s.fecha).toBe(NO_INFORMADO);
      expect(s.horario).toBe(NO_INFORMADO);
    });

    it('el DTO vigente no trae estado de asistencia: queda null y jamas se asume AUSENTE', () => {
      const s = StudentPortalMapper.toSesion(dto, ASIGNATURA, formato)!;
      expect(s.estadoAsistencia).toBeNull();
    });

    it('solo acepta un estado de asistencia explicito y valido', () => {
      expect(StudentPortalMapper.toSesion({ ...dto, estadoAsistencia: 'AUSENTE' }, ASIGNATURA, formato)!.estadoAsistencia)
        .toBe('AUSENTE');
      expect(StudentPortalMapper.toSesion({ ...dto, estadoAsistencia: 'ausente' }, ASIGNATURA, formato)!.estadoAsistencia)
        .toBeNull();
      expect(StudentPortalMapper.toSesion({ ...dto, estadoAsistencia: 'XYZ' }, ASIGNATURA, formato)!.estadoAsistencia)
        .toBeNull();
    });

    it('descarta sesiones sin UUID valido', () => {
      expect(StudentPortalMapper.toSesiones([{ ...dto, id: 'undefined' }, dto], ASIGNATURA, formato).length).toBe(1);
    });
  });
});
