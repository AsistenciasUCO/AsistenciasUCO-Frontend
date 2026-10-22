import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  CambiarEstadoProgramaPayload,
  CatalogoPrograma,
  ProgramaAcademico,
  ProgramaPayload,
  ProgramasFiltro,
} from '../models/programa-academico.model';

/**
 * Programas académicos de la facultad del decano. El estado vive en Signals y SOLO cambia con una respuesta
 * exitosa del backend; los errores se propagan tal cual para que la UI muestre el mensaje del servidor.
 */
@Injectable({ providedIn: 'root' })
export class DeanProgramasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/decano/programas`;

  readonly programas = signal<ProgramaAcademico[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(false);

  consultar(filtro: ProgramasFiltro): Observable<ApiResponse<ProgramaAcademico[]>> {
    let params = new HttpParams().set('pagina', filtro.pagina).set('tamano', filtro.tamano);
    if (filtro.nombre) {
      params = params.set('nombre', filtro.nombre);
    }
    if (filtro.estaActivo !== undefined) {
      params = params.set('estaActivo', filtro.estaActivo);
    }
    if (filtro.idTipoPrograma) {
      params = params.set('idTipoPrograma', filtro.idTipoPrograma);
    }
    this.cargando.set(true);
    return this.http.get<ApiResponse<ProgramaAcademico[]>>(this.base, { params }).pipe(
      tap((res) => {
        this.programas.set(res.datos ?? []);
        this.total.set(res.total ?? 0);
      }),
      finalize(() => this.cargando.set(false))
    );
  }

  crear(payload: ProgramaPayload): Observable<ApiResponse<ProgramaAcademico>> {
    return this.http.post<ApiResponse<ProgramaAcademico>>(this.base, payload);
  }

  actualizar(id: string, payload: ProgramaPayload): Observable<ApiResponse<ProgramaAcademico>> {
    return this.http.put<ApiResponse<ProgramaAcademico>>(`${this.base}/${id}`, payload);
  }

  cambiarEstado(id: string, estaActivo: boolean): Observable<ApiResponse<ProgramaAcademico>> {
    const cuerpo: CambiarEstadoProgramaPayload = { estaActivo };
    return this.http.patch<ApiResponse<ProgramaAcademico>>(`${this.base}/${id}/estado`, cuerpo);
  }

  getTiposPrograma(): Observable<CatalogoPrograma[]> {
    return this.http.get<CatalogoPrograma[]>(`${environment.apiUrl}/tipos-programa`);
  }

  getModalidades(): Observable<CatalogoPrograma[]> {
    return this.http.get<CatalogoPrograma[]>(`${environment.apiUrl}/modalidades-programa`);
  }

  getJornadas(): Observable<CatalogoPrograma[]> {
    return this.http.get<CatalogoPrograma[]>(`${environment.apiUrl}/jornadas-programa`);
  }
}
