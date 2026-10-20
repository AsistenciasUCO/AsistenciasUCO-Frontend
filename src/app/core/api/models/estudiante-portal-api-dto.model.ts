/**
 * DTO HTTP reales del portal estudiantil (`/api/v1/estudiante/**`).
 * Espejo de los records Java vigentes en el backend; no se agregan campos que el backend no entrega.
 */

/** `MateriaEstudianteDTO`: una fila por (asignatura, grupo) en el que el estudiante esta matriculado. */
export interface MateriaEstudianteApiDto {
  idAsignatura: string;
  nombreAsignatura: string;
  idGrupo: string;
  nombreGrupo: string;
}

/** `HorarioEstudianteDTO`. `dia` y las horas llegan como texto (`LocalTime`: `HH:mm` o `HH:mm:ss`). */
export interface HorarioEstudianteApiDto {
  id: string;
  idEstudiante: string;
  idGrupo: string;
  codigoMateria: string;
  nombreMateria: string;
  grupo: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  docente: string;
}

/**
 * `SesionMateriaEstudianteDTO`. Las fechas son `LocalDateTime` del backend: persisten en UTC pero el wire format
 * actual no incluye zona (BACKEND_GOLDEN_PATH_CONTRACT §I); si algun despliegue las emite con offset, se respeta.
 *
 * `estadoAsistencia` NO forma parte del contrato vigente: el backend no lo entrega. Se declara opcional solo como
 * lector tolerante para el contrato adicional propuesto (docs/work-items/LB-004D-student-attendance-contract.md);
 * mientras no llegue, el frontend lo trata como "no disponible".
 */
export interface SesionMateriaEstudianteApiDto {
  id: string;
  nombre: string;
  numero: number;
  codigo: string;
  numeroSemana: number;
  idGrupo: string;
  codigoGrupo: string;
  nombreGrupo: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estadoAsistencia?: string | null;
}
