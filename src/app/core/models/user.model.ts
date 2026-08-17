export type UserRole = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE' | 'PREFECTO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  institutionName: string;
  department?: string;
  status: 'active' | 'inactive';
}
