export interface DocenteApiDto {
  id: string;
  idUsuario: string;
  numeroIdentificacion: number;
  nombreCompleto: string;
  estaActivoUsuario: boolean;
}

export interface DocenteDetalleApiDto {
  id: string;
  idUsuario: string;
  numeroIdentificacion: number;
  nombreCompleto: string;
  estaActivoUsuario: boolean;
}

export interface AsignacionDocenteApiDto {
  id: string;
  idUsuario: string;
  numeroIdentificacion: number;
  nombreCompleto: string;
  estaActivoUsuario: boolean;

  idInstitucion: string;
  nombreInstitucion: string;

  idFacultad: string;
  nombreFacultad: string;

  idPrograma: string;
  nombrePrograma: string;

  idPlanEstudio: string;
  inpPlanEstudio: string;

  idAsignatura: string;
  nombreAsignatura: string;

  idGrupo: string;
  nombreGrupo: string;

  idPerfil: string;
  codigoPerfil: string;
  nombrePerfil: string;

  estaActivoDocente: boolean;
  estaActivoTextoDocente: string;
}
