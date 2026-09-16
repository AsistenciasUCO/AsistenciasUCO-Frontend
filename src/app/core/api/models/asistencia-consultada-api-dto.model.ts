export interface AsistenciaConsultadaApiDto {
  asistencia: string;
  estudiante: string;
  grupo: string;
  sesion: string;
  presente: boolean | null;
  estado: 'AN' | 'SJC' | 'EX';
  observacion: string | null;
}
