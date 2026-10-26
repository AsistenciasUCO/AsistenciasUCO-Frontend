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
  /** Roles institucionales efectivos confirmados por el backend; `role` es el de mayor jerarquía. */
  roles?: UserRole[];
  avatarUrl?: string;
  institutionName: string;
  department?: string;
  telefono?: string;
  correoAlternativo?: string;
  status: 'active' | 'inactive';
}


/** Roles efectivos del usuario normalizados (`ADMIN` → `ADMINISTRADOR`); siempre incluye el rol principal. */
export function effectiveRoles(user: Pick<User, 'role' | 'roles'>): UserRole[] {
  const normalize = (role: UserRole): UserRole => (role === 'ADMIN' ? 'ADMINISTRADOR' : role);
  return Array.from(new Set([user.role, ...(user.roles ?? [])].map(normalize)));
}

/** Verdadero si algún rol efectivo del usuario está entre los permitidos (ergonomía de UI, no seguridad). */
export function hasAnyRole(user: Pick<User, 'role' | 'roles'>, allowed: readonly UserRole[]): boolean {
  const roles = effectiveRoles(user);
  return allowed.some((role) => roles.includes(role === 'ADMIN' ? 'ADMINISTRADOR' : role));
}
