import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoIdentificacionApiDto } from '../api/models/tipo-identificacion-api-dto.model';

export const MOCK_DOCUMENT_TYPES: TipoIdentificacionApiDto[] = [
  { id: 'A1B2C3D4-0000-0000-0000-000000000001', tipoIdentificacion: 'CC', nombre: 'Cedula de Ciudadania' },
  { id: 'A1B2C3D4-0000-0000-0000-000000000002', tipoIdentificacion: 'TI', nombre: 'Tarjeta de Identidad' },
  { id: 'A1B2C3D4-0000-0000-0000-000000000004', tipoIdentificacion: 'CE', nombre: 'Cedula de Extranjeria' },
  { id: 'A1B2C3D4-0000-0000-0000-000000000003', tipoIdentificacion: 'PA', nombre: 'Pasaporte' },
];

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor(private http: HttpClient) {}

  getIdentityDocumentTypes(): Observable<TipoIdentificacionApiDto[]> {
    if (environment.useFrontendMocks) {
      return of(MOCK_DOCUMENT_TYPES).pipe(delay(200));
    }

    return this.http.get<TipoIdentificacionApiDto[]>(
      `${environment.apiUrl}/tipos-identificacion`
    );
  }
}
