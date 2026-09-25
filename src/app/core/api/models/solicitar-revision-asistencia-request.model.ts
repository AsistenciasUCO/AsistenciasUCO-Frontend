export interface SolicitarRevisionAsistenciaRequest {
  sesionId: string;
  categoria: string;
  justificacion: string;
  soporteNombre?: string;
  soporteUrl?: string;
}

