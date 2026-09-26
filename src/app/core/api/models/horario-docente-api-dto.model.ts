export interface HorarioDocenteApiDto {
  id: string;
  idDocente: string;
  idGrupo: string;
  codigoMateria: string;
  nombreMateria: string;
  seccion: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  totalEstudiantes: number;
}
