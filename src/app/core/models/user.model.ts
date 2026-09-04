export type UserRole = 'ADMINISTRADOR' | 'DECANO' | 'COORDINADOR' | 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN';

export interface User {
  id: string;
  tipoIdentificacionId?: string;
  numeroIdentificacion?: number | string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  institutionName: string;
  department?: string;
  telefono?: string;
  correoAlternativo?: string;
  status: 'active' | 'inactive';
}

