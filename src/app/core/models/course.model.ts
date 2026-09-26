import { ClassSession } from './attendance.model';

export interface Course {
  id: string;
  code: string;
  name: string;
  section: string;
  schedule: string;
  /**
   * OUT_OF_GOLDEN_PATH: HorarioDocente no entrega aula (BACKEND_GOLDEN_PATH_CONTRACT §C.1), por lo
   * que el mapping real nunca lo asigna. Solo lo usan verticales legacy (grupos/mocks/decano/coordinador).
   */
  room?: string;
  enrolledStudentsCount: number;
  cupoMaximo?: number;
  docenteName?: string;
  docenteId?: string;
  colorCategory: 'emerald' | 'amber' | 'blue' | 'purple';
  sessions?: ClassSession[];
  asignaturaId?: string;
  dias?: string[];
  horaInicio?: string;
  horaFin?: string;
}
