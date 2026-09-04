import { Course } from '../models/course.model';
import { AttendanceMapper, ClassSessionDTO } from './attendance.mapper';

/**
 * Data Transfer Object (DTO) para la entidad Grupo / Asignatura del Backend.
 */
export interface CourseDTO {
  id_curso: string;
  codigo_materia: string;
  nombre_materia: string;
  seccion_grupo: string;
  horario: string;
  aula: string;
  estudiantes_inscritos: number;
  cupo_maximo?: number | null;
  nombre_docente: string;
  id_docente?: string | null;
  categoria_color: 'emerald' | 'amber' | 'blue' | 'purple';
  sesiones?: ClassSessionDTO[] | null;
}

/**
 * Mapper para la conversión bidireccional entre CourseDTO y el modelo de dominio Course.
 */
export class CourseMapper {
  static fromDTO(dto: CourseDTO): Course {
    return {
      id: dto.id_curso,
      code: dto.codigo_materia,
      name: dto.nombre_materia,
      section: dto.seccion_grupo,
      schedule: dto.horario,
      room: dto.aula,
      enrolledStudentsCount: dto.estudiantes_inscritos,
      cupoMaximo: dto.cupo_maximo ?? undefined,
      docenteName: dto.nombre_docente,
      docenteId: dto.id_docente ?? undefined,
      colorCategory: dto.categoria_color || 'blue',
      sessions: dto.sesiones ? dto.sesiones.map(AttendanceMapper.sessionFromDTO) : undefined,
    };
  }

  static toDTO(model: Course): CourseDTO {
    return {
      id_curso: model.id,
      codigo_materia: model.code,
      nombre_materia: model.name,
      seccion_grupo: model.section,
      horario: model.schedule,
      aula: model.room,
      estudiantes_inscritos: model.enrolledStudentsCount,
      cupo_maximo: model.cupoMaximo ?? null,
      nombre_docente: model.docenteName,
      id_docente: model.docenteId ?? null,
      categoria_color: model.colorCategory,
      sesiones: model.sessions ? model.sessions.map(AttendanceMapper.sessionToDTO) : null,
    };
  }
}
