import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface IdentityDocumentTypeDTO {
  id: string;
  tipoIdentificacion: string;
  nombre: string;
}

export const MOCK_DOCUMENT_TYPES: IdentityDocumentTypeDTO[] = [
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

  getIdentityDocumentTypes(): Observable<ApiResponse<IdentityDocumentTypeDTO[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-catalog-001',
        exitoso: true,
        total: MOCK_DOCUMENT_TYPES.length,
        datos: MOCK_DOCUMENT_TYPES,
      }).pipe(delay(200));
    }

    return this.http.get<any>(`${environment.apiUrl}/tipos-identificacion`).pipe(
      map((items: any[]) => ({
        idTransaccion: 'tx-catalog-001',
        exitoso: true,
        total: items ? items.length : 0,
        datos: items
          ? items.map((i) => ({
              id: i.id,
              tipoIdentificacion: i.tipoIdentificacion,
              nombre: i.nombre,
            }))
          : [],
      }))
    );
  }
}
