import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CoordinadorItem } from '../models/role-management.model';
import { MOCK_COORDINADORES } from '../mocks/role-management.mock';

@Injectable({
  providedIn: 'root',
})
export class DeanManagementService {
  private coordinadoresList: CoordinadorItem[] = [...MOCK_COORDINADORES];

  constructor(private http: HttpClient) {}

  getCoordinadores(): Observable<ApiResponse<CoordinadorItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-coord-list',
        exitoso: true,
        total: this.coordinadoresList.length,
        datos: [...this.coordinadoresList],
      }).pipe(delay(350));
    }

    return this.http.get<ApiResponse<CoordinadorItem[]>>(`${environment.apiUrl}/decano/coordinadores`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-coordinadores',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar los coordinadores.',
          datos: [],
        })
      )
    );
  }

  createCoordinador(nuevoCoord: Omit<CoordinadorItem, 'id' | 'totalDocentes' | 'totalGrupos'>): Observable<ApiResponse<CoordinadorItem>> {
    const id = `COORD-${String(this.coordinadoresList.length + 1).padStart(3, '0')}`;
    const coordinadorCreado: CoordinadorItem = {
      ...nuevoCoord,
      id,
      totalDocentes: 0,
      totalGrupos: 0,
    };

    if (environment.useMocks) {
      this.coordinadoresList = [coordinadorCreado, ...this.coordinadoresList];
      return of({
        idTransaccion: 'mock-tx-coord-create',
        exitoso: true,
        mensajeUsuario: 'Coordinador registrado exitosamente.',
        datos: coordinadorCreado,
      }).pipe(delay(400));
    }

    return this.http.post<ApiResponse<CoordinadorItem>>(`${environment.apiUrl}/decano/coordinadores`, nuevoCoord);
  }

  toggleCoordinadorStatus(id: string): Observable<ApiResponse<CoordinadorItem | null>> {
    if (environment.useMocks) {
      const coord = this.coordinadoresList.find((c) => c.id === id);
      if (coord) {
        coord.estado = coord.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        return of({
          idTransaccion: 'mock-tx-coord-toggle',
          exitoso: true,
          mensajeUsuario: `Estado del coordinador actualizado a ${coord.estado}.`,
          datos: coord,
        }).pipe(delay(250));
      }
      return of({
        idTransaccion: 'mock-tx-coord-not-found',
        exitoso: false,
        mensajeUsuario: 'Coordinador no encontrado.',
        datos: null,
      });
    }

    return this.http.patch<ApiResponse<CoordinadorItem | null>>(`${environment.apiUrl}/decano/coordinadores/${id}/estado`, {});
  }
}
