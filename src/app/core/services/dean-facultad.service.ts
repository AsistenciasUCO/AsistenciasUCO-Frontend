import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  EstudianteFacultadItem,
  FacultadNodo,
  FichaEstudianteFacultad,
  SesionFacultadItem,
} from '../models/facultad-decano.model';

type Filtro = Record<string, string | number | boolean | null | undefined>;

/**
 * HU104/HU105/HU109/HU119/HU145: consultas de solo lectura del decano sobre su facultad. El backend limita los
 * datos a la facultad del decano autenticado; los errores se propagan para que la UI muestre el mensaje.
 */
@Injectable({ providedIn: 'root' })
export class DeanFacultadService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/decano`;

  getEstudiantes(filtro: {
    busqueda?: string | null;
    idPrograma?: string | null;
    estaActivo?: boolean | null;
    pagina: number;
    tamano: number;
  }): Observable<ApiResponse<EstudianteFacultadItem[]>> {
    return this.http.get<ApiResponse<EstudianteFacultadItem[]>>(`${this.base}/estudiantes`, {
      params: parametros(filtro),
    });
  }

  getFichaEstudiante(idEstudiante: string): Observable<ApiResponse<FichaEstudianteFacultad>> {
    return this.http.get<ApiResponse<FichaEstudianteFacultad>>(`${this.base}/estudiantes/${idEstudiante}`);
  }

  getEstructura(): Observable<ApiResponse<FacultadNodo[]>> {
    return this.http.get<ApiResponse<FacultadNodo[]>>(`${this.base}/estructura`);
  }

  getSesiones(filtro: {
    desde?: string | null;
    hasta?: string | null;
    idPrograma?: string | null;
    pagina: number;
    tamano: number;
  }): Observable<ApiResponse<SesionFacultadItem[]>> {
    return this.http.get<ApiResponse<SesionFacultadItem[]>>(`${this.base}/sesiones`, { params: parametros(filtro) });
  }
}

/** Omite los filtros vacios para que el backend aplique sus valores por defecto. */
function parametros(filtro: Filtro): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtro)) {
    if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
      params = params.set(clave, String(valor).trim());
    }
  }
  return params;
}
