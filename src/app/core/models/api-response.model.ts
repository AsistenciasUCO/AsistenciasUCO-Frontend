export interface ApiResponse<T> {
  idTransaccion?: string;
  exitoso: boolean;
  mensajeUsuario?: string;
  mensajeTecnico?: string;
  datos: T;
  total?: number;
  token?: string;
}

export interface UserAuthResponse {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
}
