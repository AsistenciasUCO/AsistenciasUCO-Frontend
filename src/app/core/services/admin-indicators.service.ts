import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ComparativaFacultad, GranularidadTendencia, KpisInstitucion, PuntoTendencia } from '../models/admin-indicators.model';

/** Lectura de indicadores de la institución del administrador: las cifras se publican tal como las entrega el backend. */
@Injectable({ providedIn: 'root' })
export class AdminIndicatorsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  readonly kpis = signal<KpisInstitucion | null>(null);
  readonly comparativa = signal<ComparativaFacultad[]>([]);
  readonly tendencia = signal<PuntoTendencia[]>([]);
  readonly cargando = signal(false);

  consultarKpis(idPeriodoAcademico?: string): Observable<ApiResponse<KpisInstitucion>> {
    this.cargando.set(true);
    return this.http.get<ApiResponse<KpisInstitucion>>(`${this.base}/indicadores`, { params: this.periodo(idPeriodoAcademico) }).pipe(
      tap((r) => this.kpis.set(r.datos)),
      finalize(() => this.cargando.set(false)),
    );
  }

  consultarComparativa(idPeriodoAcademico?: string): Observable<ApiResponse<ComparativaFacultad[]>> {
    return this.http
      .get<ApiResponse<ComparativaFacultad[]>>(`${this.base}/comparativa-facultades`, { params: this.periodo(idPeriodoAcademico) })
      .pipe(tap((r) => this.comparativa.set(r.datos)));
  }

  consultarTendencia(granularidad?: GranularidadTendencia, idPeriodoAcademico?: string): Observable<ApiResponse<PuntoTendencia[]>> {
    let params = this.periodo(idPeriodoAcademico);
    if (granularidad) params = params.set('granularidad', granularidad);
    return this.http
      .get<ApiResponse<PuntoTendencia[]>>(`${this.base}/tendencia-ausentismo`, { params })
      .pipe(tap((r) => this.tendencia.set(r.datos)));
  }

  private periodo(idPeriodoAcademico?: string): HttpParams {
    let params = new HttpParams();
    if (idPeriodoAcademico) params = params.set('idPeriodoAcademico', idPeriodoAcademico);
    return params;
  }
}
