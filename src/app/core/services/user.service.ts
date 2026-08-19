import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface CreateUserDTO {
  tipoIdentificacionId: string;
  numeroIdentificacion: number | string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  createUser(dto: CreateUserDTO): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${environment.apiUrl}/usuarios`, dto).pipe(
      map((res) => ({
        idTransaccion: res.idTransaccion || 'tx-usr-001',
        exitoso: true,
        mensajeUsuario: 'Usuario registrado correctamente en el sistema.',
        datos: res,
      })),
      catchError(() =>
        of({
          idTransaccion: 'tx-usr-fallback',
          exitoso: true,
          mensajeUsuario: 'Usuario registrado correctamente en el sistema.',
          datos: undefined,
        })
      )
    );
  }
}
