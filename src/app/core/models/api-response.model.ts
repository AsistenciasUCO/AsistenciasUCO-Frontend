export interface ApiResponse<T> {
  idTransaccion?: string;
  exitoso: boolean;
  mensajeUsuario?: string;
  mensajeTecnico?: string;
  datos: T;
  total?: number;
  token?: string;
}

export interface AuthenticatedUser {
  keycloakSub: string;
  idUsuario?: string;
  username: string;
  nombres: string;
  apellidos: string;
  correo: string;
  roles: string[];
}
