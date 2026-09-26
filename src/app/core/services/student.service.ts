import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EstudianteDetalleApiDto,
  EstudiantePaginaApiDto,
} from '../api/models/estudiante-api-dto.model';
import { OperationResultResponse } from '../api/models/operation-result-response.model';
import { RegistrarEstudianteEnGrupoRequest } from '../api/models/registrar-estudiante-en-grupo-request.model';
import { getPasswordValidationError } from '../validation/request-form-validation.util';

export interface EnrollStudentFormValue {
  grupo: string;
  tipoDocumento: string;
  numeroIdentificacion: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  password: string;
}

export type EnrollStudentDTO = EnrollStudentFormValue;

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  enrollStudentInGroup(
    dto: EnrollStudentFormValue
  ): Observable<OperationResultResponse> {
    if (environment.useFrontendMocks) {
      return of({
        exitoso: true,
        mensajeUsuario: 'Estudiante matriculado y vinculado al grupo exitosamente.',
      }).pipe(delay(400));
    }

    const password = dto.password?.trim() ?? '';
    const passwordError = getPasswordValidationError(
      password,
      String(dto.numeroIdentificacion)
    );
    if (passwordError) {
      return throwError(() => new Error(passwordError));
    }

    const request: RegistrarEstudianteEnGrupoRequest = {
      tipoIdentificacionId: dto.tipoDocumento,
      numeroIdentificacion: dto.numeroIdentificacion,
      primerNombre: dto.primerNombre.trim(),
      primerApellido: dto.primerApellido.trim(),
      correo: dto.correoElectronico.trim(),
      password,
    };

    if (dto.segundoNombre?.trim()) {
      request.segundoNombre = dto.segundoNombre.trim();
    }

    if (dto.segundoApellido?.trim()) {
      request.segundoApellido = dto.segundoApellido.trim();
    }

    return this.http.post<OperationResultResponse>(
      `${environment.apiUrl}/grupos/${dto.grupo}/estudiantes`,
      request
    );
  }

  getStudentsByGroup(
    grupoId: string
  ): Observable<EstudiantePaginaApiDto> {
    if (environment.useFrontendMocks) {
      return of({
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: 0,
        size: 0,
      }).pipe(delay(200));
    }

    return this.http.get<EstudiantePaginaApiDto>(
      `${environment.apiUrl}/estudiantes`,
      {
        params: grupoId ? { grupoId } : {},
      }
    );
  }

  getStudentById(
    estudianteId: string
  ): Observable<EstudianteDetalleApiDto> {
    return this.http.get<EstudianteDetalleApiDto>(
      `${environment.apiUrl}/estudiantes/${estudianteId}`
    );
  }
}
