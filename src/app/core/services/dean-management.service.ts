import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CoordinadorItem } from '../models/role-management.model';

@Injectable({
  providedIn: 'root',
})
export class DeanManagementService {
  constructor(private http: HttpClient) {}

  getCoordinadores(): Observable<ApiResponse<CoordinadorItem[]>> {
    return this.http.get<ApiResponse<CoordinadorItem[]>>(`${environment.apiUrl}/decano/coordinadores`);
  }

  createCoordinador(nuevoCoord: Omit<CoordinadorItem, 'id' | 'totalDocentes' | 'totalGrupos'>): Observable<ApiResponse<CoordinadorItem>> {
    return this.http.post<ApiResponse<CoordinadorItem>>(`${environment.apiUrl}/decano/coordinadores`, nuevoCoord);
  }

  toggleCoordinadorStatus(id: string): Observable<ApiResponse<CoordinadorItem | null>> {
    return this.http.patch<ApiResponse<CoordinadorItem | null>>(`${environment.apiUrl}/decano/coordinadores/${id}/toggle`, {});
  }
}
