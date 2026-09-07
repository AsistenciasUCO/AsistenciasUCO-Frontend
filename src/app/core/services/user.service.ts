import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearUsuarioRequest } from '../api/models/crear-usuario-request.model';
import { OperationResultResponse } from '../api/models/operation-result-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  createUser(
    request: CrearUsuarioRequest
  ): Observable<OperationResultResponse> {
    return this.http.post<OperationResultResponse>(
      `${environment.apiUrl}/usuarios`,
      request
    );
  }
}
