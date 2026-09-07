import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiMessageResponse } from '../api/models/api-message-response.model';
import { CerrarSesionRequest } from '../api/models/cerrar-sesion-request.model';
import { CrearSesionRequest } from '../api/models/crear-sesion-request.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private http: HttpClient) {}

  createSession(
    request: CrearSesionRequest
  ): Observable<ApiMessageResponse> {
    if (!environment.features.sessionsEnabled) {
      return throwError(
        () =>
          new Error(
            'Funcionalidad de sesiones temporalmente no disponible.'
          )
      );
    }

    return this.http.post<ApiMessageResponse>(
      `${environment.apiUrl}/sesiones`,
      request
    );
  }

  closeSession(
    request: CerrarSesionRequest
  ): Observable<ApiMessageResponse> {
    if (!environment.features.sessionsEnabled) {
      return throwError(
        () =>
          new Error(
            'Funcionalidad de sesiones temporalmente no disponible.'
          )
      );
    }

    return this.http.post<ApiMessageResponse>(
      `${environment.apiUrl}/sesiones/cierres`,
      request
    );
  }
}
