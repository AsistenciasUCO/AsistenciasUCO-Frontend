export type ApiRole =
  | 'AD'
  | 'DE'
  | 'CD'
  | 'DO'
  | 'ES';

export interface AuthenticatedUser {
  keycloakSub: string;
  idUsuario: string;
  username: string;
  nombres: string;
  apellidos: string;
  correo: string;
  roles: ApiRole[];
}
