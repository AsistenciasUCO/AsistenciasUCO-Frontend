import { ClassSession } from './attendance.model';

export interface Course {
  id: string;
  code: string;
  name: string;
  section: string;
  schedule: string;
  room: string;
  enrolledStudentsCount: number;
  cupoMaximo?: number;
  docenteName: string;
  docenteId?: string;
  colorCategory: 'emerald' | 'amber' | 'blue' | 'purple';
  sessions?: ClassSession[];
  asignaturaId?: string;
  dias?: string[];
  horaInicio?: string;
  horaFin?: string;
}
