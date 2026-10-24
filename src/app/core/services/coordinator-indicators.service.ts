import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AlertaTemprana,
  AlertasFiltro,
  BitacoraSesion,
  FichaEstudiante,
  KpisCoordinador,
} from '../models/coordinator-indicators.model';

/** Lectura de indicadores del coordinador: las cifras se publican tal como las entrega el backend. */
@Injectable({ providedIn: 'root' })
export class CoordinatorIndicatorsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/coordinador`;

  readonly kpis = signal<KpisCoordinador | null>(null);
  readonly alertas = signal<AlertaTemprana[]>([]);
  readonly totalAlertas = signal(0);
  readonly cargando = signal(false);

  consultarKpis(idPeriodoAcademico?: string): Observable<ApiResponse<KpisCoordinador>> {
    this.cargando.set(true);
    let params = new HttpParams();
    if (idPeriodoAcademico) params = params.set('idPeriodoAcademico', idPeriodoAcademico);
    return this.http.get<ApiResponse<KpisCoordinador>>(`${this.base}/indicadores`, { params }).pipe(
      tap((r) => this.kpis.set(r.datos)),
      finalize(() => this.cargando.set(false)),
    );
  }

  consultarAlertas(filtro: AlertasFiltro): Observable<ApiResponse<AlertaTemprana[]>> {
    let params = new HttpParams().set('pagina', filtro.pagina).set('tamano', filtro.tamano);
    if (filtro.semaforo) params = params.set('semaforo', filtro.semaforo);
    if (filtro.nombre) params = params.set('nombre', filtro.nombre);
    if (filtro.idPeriodoAcademico) params = params.set('idPeriodoAcademico', filtro.idPeriodoAcademico);
    return this.http.get<ApiResponse<AlertaTemprana[]>>(`${this.base}/alertas-tempranas`, { params }).pipe(
      tap((r) => {
        this.alertas.set(r.datos);
        this.totalAlertas.set(r.total ?? 0);
      }),
    );
  }

  consultarBitacora(
    idEstudiante: string,
    pagina: number,
    tamano: number,
    idPeriodoAcademico?: string,
  ): Observable<ApiResponse<BitacoraSesion[]>> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (idPeriodoAcademico) params = params.set('idPeriodoAcademico', idPeriodoAcademico);
    return this.http.get<ApiResponse<BitacoraSesion[]>>(`${this.base}/estudiantes/${idEstudiante}/bitacora`, { params });
  }

  consultarFicha(idEstudiante: string): Observable<ApiResponse<FichaEstudiante>> {
    return this.http.get<ApiResponse<FichaEstudiante>>(`${this.base}/estudiantes/${idEstudiante}/ficha`);
  }
}
