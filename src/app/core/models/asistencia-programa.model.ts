/** HU064/HU060/HU061: consultas de solo lectura del coordinador sobre su programa. */
export interface GrupoProgramaItem {
  id: string;
  codigo: number | null;
  nombre: string;
  idAsignatura: string | null;
  nombreAsignatura: string;
  idDocente: string | null;
  capacidadMaxima: number | null;
  estudiantesActivos: number | null;
  cuposDisponibles: number | null;
  habilitado: boolean;
  inicioPeriodo: string | null;
  finPeriodo: string | null;
}

export interface SesionGrupoItem {
  id: string;
  idGrupo: string;
  codigoGrupo: number | null;
  nombreGrupo: string;
  nombre: string;
  numero: number | null;
  codigo: string;
  numeroSemana: number | null;
  fechaHoraInicio: string | null;
  fechaHoraFin: string | null;
}

export interface AsistenciaSesionItem {
  idDetalleAsistencia: string;
  idSesion: string;
  nombreSesion: string;
  idEstudiante: string | null;
  numeroIdentificacion: string | null;
  nombreCompleto: string;
  asistio: boolean;
  codigoRazonCausa: string | null;
  nombreRazonCausa: string | null;
  fechaHoraInicio: string | null;
  fechaHoraFin: string | null;
}

