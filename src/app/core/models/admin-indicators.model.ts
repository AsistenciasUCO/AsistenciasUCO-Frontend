export type GranularidadTendencia = 'SEMANA' | 'MES';

export interface KpisInstitucion {
  idInstitucion: string;
  nombreInstitucion: string;
  idPeriodoAcademico: string | null;
  nombrePeriodoAcademico: string | null;
  totalFacultades: number;
  totalProgramas: number;
  totalEstudiantes: number;
  estudiantesRegulares: number;
  estudiantesRiesgo: number;
  estudiantesPerdida: number;
  tasaRetencion: number | null;
  sesionesEjecutadas: number;
  faltasSinJustaCausa: number;
  porcentajeAusentismo: number | null;
  porcentajeAsistencia: number | null;
  sesionesVencidas: number;
  sesionesConRegistro: number;
  porcentajeCumplimiento: number | null;
  estudiantesConMatriculaActiva: number;
  estudiantesRegistrados: number;
  docentesConGrupoActivo: number;
  docentesRegistrados: number;
  umbralAdvertencia: number;
  umbralPerdida: number;
}

export interface ComparativaFacultad {
  idFacultad: string;
  nombreFacultad: string;
  estaActivaFacultad: boolean;
  totalProgramas: number;
  totalEstudiantes: number;
  estudiantesRiesgo: number;
  estudiantesPerdida: number;
  tasaRetencion: number | null;
  sesionesEjecutadas: number;
  faltasSinJustaCausa: number;
  porcentajeAusentismo: number | null;
}

export interface PuntoTendencia {
  inicioIntervalo: string;
  finIntervalo: string;
  sesionesEjecutadas: number;
  faltasSinJustaCausa: number;
  porcentajeAusentismo: number | null;
}
