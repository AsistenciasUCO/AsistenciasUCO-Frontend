import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HorarioItem, MateriaEstudianteItem } from '../models/role-management.model';

@Injectable({
  providedIn: 'root',
})
export class StudentManagementService {
  constructor(private http: HttpClient) {}

  getHorarios(): Observable<ApiResponse<HorarioItem[]>> {
    return this.http.get<ApiResponse<HorarioItem[]>>(`${environment.apiUrl}/estudiante/horarios`);
  }

  getMaterias(): Observable<ApiResponse<MateriaEstudianteItem[]>> {
    return this.http.get<ApiResponse<MateriaEstudianteItem[]>>(`${environment.apiUrl}/estudiante/materias`);
  }

  getPrerrequisitosMateria(materiaId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/estudiante/materias/${materiaId}/prerrequisitos`);
  }

  matricularGrupo(codigoOPin: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/estudiante/matricular-grupo`, {
      codigo: codigoOPin,
    });
  }
}

