export type AttendanceStatus = 'AN' | 'SJC' | 'EX';

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentCode: string;
  avatarUrl?: string;
  status: AttendanceStatus;
  notes?: string;
  arrivalTime?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  sessionNumber: number;
  title: string;
  topic: string;
  date: string; // ISO format (YYYY-MM-DD)
  startTime: string;
  endTime: string;
  status: 'PROGRAMADA' | 'EN_CURSO' | 'CONCLUIDA';
  records: StudentAttendance[];
}
