export type SemaforoAlerta = 'ROJO' | 'AMARILLO' | 'VERDE';

export interface KpisCoordinador {
  idPrograma: string;
  nombrePrograma: string;
  idPeriodoAcademico: string | null;
  nombrePeriodoAcademico: string | null;
  totalEstudiantes: number;
  estudiantesRegulares: number;
  estudiantesRiesgo: number;
  estudiantesPerdida: number;
  tasaPermanencia: number | null;
  sesionesProgramadas: number;
  sesionesVencidas: number;
  sesionesEjecutadas: number;
  sesionesVencidasSinRegistro: number;
  sesionesSinProcedenciaTemporal: number;
  porcentajeCumplimiento: number | null;
  porcentajeProgresoCalendario: number | null;
  umbralAdvertencia: number;
  umbralPerdida: number;
}

export interface AlertaTemprana {
  idEstudiante: string;
  nombreCompleto: string;
  numeroIdentificacion: number;
  correo: string;
  totalMatriculasActivas: number;
  porcentajeInasistencia: number | null;
  faltasSinJustaCausa: number;
  codigoPermanencia: string;
  semaforo: SemaforoAlerta;
}

export interface AlertasFiltro {
  pagina: number;
  tamano: number;
  semaforo?: SemaforoAlerta;
  nombre?: string;
  idPeriodoAcademico?: string;
}

export interface BitacoraSesion {
  idSesion: string;
  numeroSesion: number;
  nombreSesion: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  idGrupo: string;
  codigoGrupo: number;
  idAsignatura: string;
  nombreAsignatura: string;
  asistio: boolean | null;
  codigoRazonCausa: string | null;
  nombreRazonCausa: string | null;
}

export interface ResumenAsignaturaEstudiante {
  idGrupo: string;
  codigoGrupo: number;
  idAsignatura: string;
  nombreAsignatura: string;
  codigoEstadoEstudiante: string;
  nombreEstadoEstudiante: string;
  sesionesEjecutadas: number;
  asistencias: number;
  faltasSinJustaCausa: number;
  excusas: number;
  porcentajeInasistencia: number | null;
  codigoPermanencia: string;
}

export interface FichaEstudiante {
  idEstudiante: string;
  tipoIdentificacion: string;
  numeroIdentificacion: number;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string;
  correo: string;
  estaActivoUsuario: boolean;
  idPrograma: string;
  nombrePrograma: string;
  resumenPorAsignatura: ResumenAsignaturaEstudiante[];
}
