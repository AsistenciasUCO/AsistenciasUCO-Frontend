import { StudentAttendance, AttendanceStatus } from '../models/attendance.model';
import { AsistenciaConsultadaApiDto } from '../api/models/asistencia-consultada-api-dto.model';
import { EstudianteGrupoApiDto } from '../api/models/estudiante-grupo-api-dto.model';

/**
 * Mapper para Serialización y Deserialización de Asistencias y Sesiones.
 * Desacopla la estructura de red/almacenamiento de los modelos utilizados en componentes Angular.
 */
export class AttendanceMapper {
  static fromGroupStudentsAndAttendances(
    students: EstudianteGrupoApiDto[],
    attendances: AsistenciaConsultadaApiDto[]
  ): StudentAttendance[] {
    const attendanceByStudent = new Map(
      attendances.map((attendance) => [attendance.estudiante, attendance])
    );

    return students.map((student) => {
      const attendance = attendanceByStudent.get(student.idEstudiante);
      const status = attendance?.estado ?? null;

      if (status !== null && !AttendanceMapper.isAttendanceStatus(status)) {
        throw new Error(
          `Estado de asistencia no soportado para ${student.idEstudiante}: ${String(
            status
          )}`
        );
      }

      return {
        studentId: student.idEstudiante,
        studentName: student.nombreCompleto,
        studentCode: student.documento,
        status,
      };
    });
  }

  private static isAttendanceStatus(value: unknown): value is AttendanceStatus {
    return value === 'AN' || value === 'SJC' || value === 'EX';
  }
}
