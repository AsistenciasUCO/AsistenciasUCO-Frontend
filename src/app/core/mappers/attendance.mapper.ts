import { StudentAttendance, ClassSession, AttendanceStatus } from '../models/attendance.model';

/**
 * Data Transfer Object (DTO) para la asistencia individual de un estudiante según el contrato API/JSON.
 */
export interface StudentAttendanceDTO {
  id_estudiante: string;
  nombre_estudiante: string;
  codigo_estudiante: string;
  avatar_url?: string | null;
  estado_asistencia: 'AN' | 'SJC' | 'EX';
  observaciones?: string | null;
  hora_llegada?: string | null;
}

/**
 * Data Transfer Object (DTO) para una sesión académica completa con sus registros de asistencia.
 */
export interface ClassSessionDTO {
  id: string;
  curso_id: string;
  numero_sesion: number;
  titulo: string;
  tema: string;
  fecha_sesion: string; // ISO YYYY-MM-DD
  hora_inicio: string;  // HH:mm
  hora_fin: string;     // HH:mm
  aula?: string | null;
  tipo_sesion?: 'REGULAR' | 'EXTRAORDINARIA' | 'REPOSICION';
  estado_sesion: 'PROGRAMADA' | 'EN_CURSO' | 'CONCLUIDA';
  asistencias: StudentAttendanceDTO[];
}

/**
 * Mapper para Serialización y Deserialización de Asistencias y Sesiones.
 * Desacopla la estructura de red/almacenamiento de los modelos utilizados en componentes Angular.
 */
export class AttendanceMapper {
  /**
   * Deserializa un DTO de asistencia a un modelo de interfaz de usuario.
   */
  static studentFromDTO(dto: StudentAttendanceDTO): StudentAttendance {
    return {
      studentId: dto.id_estudiante,
      studentName: dto.nombre_estudiante,
      studentCode: dto.codigo_estudiante,
      avatarUrl: dto.avatar_url ?? undefined,
      status: (dto.estado_asistencia as AttendanceStatus) || 'AN',
      notes: dto.observaciones ?? undefined,
      arrivalTime: dto.hora_llegada ?? undefined,
    };
  }

  /**
   * Serializa un modelo de interfaz de usuario a un DTO listo para envío por red o almacenamiento JSON.
   */
  static studentToDTO(model: StudentAttendance): StudentAttendanceDTO {
    return {
      id_estudiante: model.studentId,
      nombre_estudiante: model.studentName,
      codigo_estudiante: model.studentCode,
      avatar_url: model.avatarUrl ?? null,
      estado_asistencia: model.status,
      observaciones: model.notes ?? null,
      hora_llegada: model.arrivalTime ?? null,
    };
  }

  /**
   * Deserializa una sesión de clase desde su representación DTO.
   */
  static sessionFromDTO(dto: ClassSessionDTO): ClassSession {
    return {
      id: dto.id,
      courseId: dto.curso_id,
      sessionNumber: dto.numero_sesion,
      title: dto.titulo,
      topic: dto.tema,
      date: dto.fecha_sesion,
      startTime: dto.hora_inicio,
      endTime: dto.hora_fin,
      room: dto.aula ?? undefined,
      tipo: dto.tipo_sesion,
      status: dto.estado_sesion,
      records: (dto.asistencias || []).map(AttendanceMapper.studentFromDTO),
    };
  }

  /**
   * Serializa un modelo de sesión de clase a su formato DTO estructurado.
   */
  static sessionToDTO(model: ClassSession): ClassSessionDTO {
    return {
      id: model.id,
      curso_id: model.courseId,
      numero_sesion: model.sessionNumber,
      titulo: model.title,
      tema: model.topic,
      fecha_sesion: model.date,
      hora_inicio: model.startTime,
      hora_fin: model.endTime,
      aula: model.room ?? null,
      tipo_sesion: model.tipo,
      estado_sesion: model.status,
      asistencias: (model.records || []).map(AttendanceMapper.studentToDTO),
    };
  }
}
