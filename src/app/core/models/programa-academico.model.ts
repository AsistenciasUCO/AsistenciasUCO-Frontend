/** Programa académico tal como lo entrega `GET /api/v1/decano/programas` (HU076, HU077, HU078, HU108). */
export interface ProgramaAcademico {
  id: string;
  nombre: string;
  idTipoPrograma: string;
  nombreTipoPrograma: string | null;
  idModalidad: string | null;
  nombreModalidad: string | null;
  idJornada: string | null;
  nombreJornada: string | null;
  idCoordinador: string;
  nombreCoordinador: string | null;
  idFacultad: string;
  nombreFacultad: string | null;
  estaActivo: boolean;
}

/** Cuerpo del alta (POST) y del reemplazo completo (PUT). La facultad la resuelve el backend. */
export interface ProgramaPayload {
  nombre: string;
  idTipoPrograma: string;
  idCoordinador: string;
  idModalidad: string | null;
  idJornada: string | null;
}

export interface CambiarEstadoProgramaPayload {
  estaActivo: boolean;
}

export interface ProgramasFiltro {
  pagina: number;
  tamano: number;
  nombre?: string;
  estaActivo?: boolean;
  idTipoPrograma?: string;
}

/** Item de catálogo (tipo de programa, modalidad o jornada). */
export interface CatalogoPrograma {
  id: string;
  codigo: string;
  nombre: string;
}

/** Opción del selector de coordinador. */
export interface CoordinadorOpcion {
  id: string;
  nombre: string;
}
