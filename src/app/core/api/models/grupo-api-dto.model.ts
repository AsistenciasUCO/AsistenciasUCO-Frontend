export interface GrupoApiDto {
  id: string;
  codigo: string;
  nombre: string;
  idAsignatura: string;
  nombreAsignatura: string;
  idDocente: string;
  capacidadMaximaPermitida: number;
  estudiantesActivos: number;
  cuposDisponibles: number;
  grupoHabilitado: boolean;
  fechaInicioPeriodoAcademico: string;
  fechaFinPeriodoAcademico: string;
}
