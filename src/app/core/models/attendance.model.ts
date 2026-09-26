export type AttendanceStatus = 'AN' | 'SJC' | 'EX';

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentCode: string;
  avatarUrl?: string;
  /** `null` representa que el docente todavía no ha registrado asistencia. */
  status: AttendanceStatus | null;
  arrivalTime?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  sessionNumber: number;
  title: string;
  date: string; // ISO format (YYYY-MM-DD)
  startTime: string;
  endTime: string;
  records: StudentAttendance[];
}
