import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AforoFiltro, AforoGrupo, ComparativaPrograma, KpisDecano } from '../models/dean-indicators.model';

/** Lectura de indicadores de la facultad del decano: las cifras se publican tal como las entrega el backend. */
@Injectable({ providedIn: 'root' })
export class DeanIndicatorsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/decano`;

  readonly kpis = signal<KpisDecano | null>(null);
  readonly comparativa = signal<ComparativaPrograma[]>([]);
  readonly aforo = signal<AforoGrupo[]>([]);
  readonly totalAforo = signal(0);
  readonly cargando = signal(false);

  consultarKpis(idPeriodoAcademico?: string): Observable<ApiResponse<KpisDecano>> {
    this.cargando.set(true);
    return this.http.get<ApiResponse<KpisDecano>>(`${this.base}/indicadores`, { params: this.periodo(idPeriodoAcademico) }).pipe(
      tap((r) => this.kpis.set(r.datos)),
      finalize(() => this.cargando.set(false)),
    );
  }

  consultarComparativa(idPeriodoAcademico?: string): Observable<ApiResponse<ComparativaPrograma[]>> {
    return this.http
      .get<ApiResponse<ComparativaPrograma[]>>(`${this.base}/comparativa-programas`, { params: this.periodo(idPeriodoAcademico) })
      .pipe(tap((r) => this.comparativa.set(r.datos)));
  }

  consultarAforo(filtro: AforoFiltro): Observable<ApiResponse<AforoGrupo[]>> {
    let params = new HttpParams().set('pagina', filtro.pagina).set('tamano', filtro.tamano);
    if (filtro.idPrograma) params = params.set('idPrograma', filtro.idPrograma);
    if (filtro.idPeriodoAcademico) params = params.set('idPeriodoAcademico', filtro.idPeriodoAcademico);
    if (filtro.soloHabilitados !== undefined) params = params.set('soloHabilitados', filtro.soloHabilitados);
    return this.http.get<ApiResponse<AforoGrupo[]>>(`${this.base}/aforo-grupos`, { params }).pipe(
      tap((r) => {
        this.aforo.set(r.datos);
        this.totalAforo.set(r.total ?? 0);
      }),
    );
  }

  private periodo(idPeriodoAcademico?: string): HttpParams {
    let params = new HttpParams();
    if (idPeriodoAcademico) params = params.set('idPeriodoAcademico', idPeriodoAcademico);
    return params;
  }
}
