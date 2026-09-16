export interface RegistrarAsistenciasSesionRequest {
  sesionId: string;
  registros: Array<{
    estudianteId: string;
    estado: 'AN' | 'SJC' | 'EX';
  }>;
}
