export interface RegistrarAsistenciaRequest {
  estudiante: string;
  grupo: string;
  sesion: string;
  presente: boolean;
  observacion?: string;
}
