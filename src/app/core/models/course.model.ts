import { ClassSession } from './attendance.model';

export interface Course {
  id: string;
  code: string;
  name: string;
  section: string;
  schedule: string;
  room: string;
  enrolledStudentsCount: number | null;
  docenteName: string;
  colorCategory: 'emerald' | 'amber' | 'blue' | 'purple';
  sessions?: ClassSession[];
}
