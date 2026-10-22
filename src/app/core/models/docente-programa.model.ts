/** Vinculo docente-programa tal como lo expone `GET /api/v1/coordinador/docentes` (HU062/HU089). */
export interface DocentePrograma {
  idDocentePrograma: string;
  idDocente: string;
  idUsuario: string;
  codigoTipoIdentificacion: string;
  numeroIdentificacion: number;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string;
  correo: string;
  idTipoVinculacion: string;
  codigoTipoVinculacion: string;
  nombreTipoVinculacion: string;
  fechaVinculacionUtc: string;
  totalGruposPrograma: number;
  estaActivo: boolean;
}

/** Candidato del picker de docentes existentes (datos minimos, sin correo). */
export interface DocenteCandidato {
  idDocente: string;
  idUsuario: string;
  codigoTipoIdentificacion: string;
  numeroIdentificacion: number;
  nombreCompleto: string;
}

export interface TipoVinculacionItem {
  id: string;
  codigo: string;
  nombre: string;
}

export interface DocentesProgramaFiltro {
  pagina: number;
  tamano: number;
  busqueda?: string;
  estaActivo?: boolean;
  idTipoVinculacion?: string;
}

export interface VincularDocenteExistentePayload {
  idDocente: string;
  idTipoVinculacion: string;
}

export interface VincularDocenteNuevoPayload {
  idTipoIdentificacion: string;
  numeroIdentificacion: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  password: string;
  idTipoVinculacion: string;
}

export type VincularDocentePayload = VincularDocenteExistentePayload | VincularDocenteNuevoPayload;

/** HU092: solo los campos presentes se modifican; "" limpia segundo nombre/apellido. Correo y documento no se editan. */
export interface ActualizarDocentePayload {
  idTipoVinculacion?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
}
