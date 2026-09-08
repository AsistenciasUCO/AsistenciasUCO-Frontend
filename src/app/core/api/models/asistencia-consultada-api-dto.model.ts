export interface AsistenciaConsultadaApiDto {
  asistencia: string;
  estudiante: string;
  grupo: string;
  sesion: string;
  presente: boolean | null;
  observacion: string | null;
}
