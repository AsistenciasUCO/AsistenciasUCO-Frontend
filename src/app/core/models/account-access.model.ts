/**
 * Estado de acceso de una cuenta registrada. El backend compara la base institucional, el proveedor de identidad y el
 * motor de autorización (PDP); la SPA solo lo muestra: nunca administra el PDP directamente.
 */
export type AccountAccessState = 'ACTIVA' | 'PENDIENTE_SINCRONIZACION' | 'INACTIVA' | 'PROBLEMA';

export interface AccountRoleAccess {
  rol: string;
  /** La base institucional mantiene el rol activo. */
  esperado: boolean;
  /** El proveedor de identidad lo tiene asignado. */
  enProveedor: boolean;
  /** ASIGNADO, NO_ASIGNADO, PENDIENTE_PERSONA_NO_REGISTRADA, PENDIENTE_NO_DISPONIBLE, RECHAZADO o NO_APLICA. */
  perfil: string;
}

export interface AccountAccess {
  usuario: string;
  estado: AccountAccessState;
  detalle: string;
  roles: AccountRoleAccess[];
}
