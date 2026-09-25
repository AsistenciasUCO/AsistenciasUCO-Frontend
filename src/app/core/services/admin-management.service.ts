import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  DecanoItem,
  SedeInstitucionalItem,
  EspacioFisicoItem,
  FacultadItem,
  AreaConocimientoItem,
  ParametroInstitucionalItem,
  RegistroAuditoriaItem,
  CierrePeriodoReporte,
  InstitucionItem,
} from '../models/role-management.model';

@Injectable({
  providedIn: 'root',
})
export class AdminManagementService {
  // Sedes
  private _sedes = signal<SedeInstitucionalItem[]>([]);
  sedes = this._sedes.asReadonly();

  // Espacios Físicos
  private _espacios = signal<EspacioFisicoItem[]>([]);
  espacios = this._espacios.asReadonly();

  // Facultades
  private _facultades = signal<FacultadItem[]>([]);
  facultades = this._facultades.asReadonly();

  // Áreas de Conocimiento
  private _areas = signal<AreaConocimientoItem[]>([]);
  areas = this._areas.asReadonly();

  // Parámetros Institucionales
  private _parametros = signal<ParametroInstitucionalItem[]>([]);
  parametros = this._parametros.asReadonly();

  // Auditoría
  private _auditoria = signal<RegistroAuditoriaItem[]>([]);
  auditoria = this._auditoria.asReadonly();

  // Reportes Cierre Masivo
  private _reportesCierre = signal<CierrePeriodoReporte[]>([]);
  reportesCierre = this._reportesCierre.asReadonly();

  constructor(private http: HttpClient) {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.cargarSedes().subscribe();
    this.cargarEspacios().subscribe();
    this.cargarFacultades().subscribe();
    this.cargarAreas().subscribe();
    this.cargarParametros().subscribe();
    this.cargarAuditoria().subscribe();
  }

  // ================= DECANOS =================
  getDecanos(): Observable<ApiResponse<DecanoItem[]>> {
    return this.http.get<ApiResponse<DecanoItem[]>>(`${environment.apiUrl}/admin/decanos`);
  }

  createDecano(nuevoDecano: Omit<DecanoItem, 'id'>): Observable<ApiResponse<DecanoItem>> {
    return this.http.post<ApiResponse<DecanoItem>>(`${environment.apiUrl}/admin/decanos`, nuevoDecano);
  }

  toggleDecanoStatus(id: string): Observable<ApiResponse<DecanoItem | null>> {
    return this.http.patch<ApiResponse<DecanoItem | null>>(`${environment.apiUrl}/admin/decanos/${id}/toggle`, {});
  }

  // ================= SEDES =================
  cargarSedes(): Observable<ApiResponse<SedeInstitucionalItem[]>> {
    return this.http.get<ApiResponse<SedeInstitucionalItem[]>>(`${environment.apiUrl}/admin/sedes`).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._sedes.set(res.datos);
        }
      })
    );
  }

  crearSede(item: Omit<SedeInstitucionalItem, 'id'>): void {
    this.http.post<ApiResponse<SedeInstitucionalItem>>(`${environment.apiUrl}/admin/sedes`, item).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._sedes.update((prev) => [res.datos, ...prev]);
        }
      })
    ).subscribe();
  }

  actualizarSede(id: string, cambios: Partial<SedeInstitucionalItem>): void {
    this.http.put<ApiResponse<SedeInstitucionalItem>>(`${environment.apiUrl}/admin/sedes/${id}`, cambios).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._sedes.update((prev) => prev.map((s) => (s.id === id ? res.datos : s)));
        }
      })
    ).subscribe();
  }

  cambiarEstadoSede(id: string): void {
    this.http.patch<ApiResponse<SedeInstitucionalItem>>(`${environment.apiUrl}/admin/sedes/${id}/estado`, {}).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._sedes.update((prev) => prev.map((s) => (s.id === id ? res.datos : s)));
        }
      })
    ).subscribe();
  }

  // ================= ESPACIOS FÍSICOS =================
  cargarEspacios(): Observable<ApiResponse<EspacioFisicoItem[]>> {
    return this.http.get<ApiResponse<EspacioFisicoItem[]>>(`${environment.apiUrl}/admin/espacios-fisicos`).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._espacios.set(res.datos);
        }
      })
    );
  }

  crearEspacio(item: Omit<EspacioFisicoItem, 'id'>): void {
    this.http.post<ApiResponse<EspacioFisicoItem>>(`${environment.apiUrl}/admin/espacios-fisicos`, item).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._espacios.update((prev) => [res.datos, ...prev]);
        }
      })
    ).subscribe();
  }

  actualizarEspacio(id: string, cambios: Partial<EspacioFisicoItem>): void {
    this.http.put<ApiResponse<EspacioFisicoItem>>(`${environment.apiUrl}/admin/espacios-fisicos/${id}`, cambios).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._espacios.update((prev) => prev.map((e) => (e.id === id ? res.datos : e)));
        }
      })
    ).subscribe();
  }

  cambiarEstadoEspacio(id: string): void {
    this.http.patch<ApiResponse<EspacioFisicoItem>>(`${environment.apiUrl}/admin/espacios-fisicos/${id}/estado`, {}).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._espacios.update((prev) => prev.map((e) => (e.id === id ? res.datos : e)));
        }
      })
    ).subscribe();
  }

  // ================= FACULTADES Y ÁREAS =================
  cargarFacultades(): Observable<ApiResponse<FacultadItem[]>> {
    return this.http.get<ApiResponse<FacultadItem[]>>(`${environment.apiUrl}/admin/facultades`).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._facultades.set(res.datos);
        }
      })
    );
  }

  crearFacultad(item: Omit<FacultadItem, 'id'>): void {
    this.http.post<ApiResponse<FacultadItem>>(`${environment.apiUrl}/admin/facultades`, item).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._facultades.update((prev) => [res.datos, ...prev]);
        }
      })
    ).subscribe();
  }

  actualizarFacultad(id: string, cambios: Partial<FacultadItem>): void {
    this.http.put<ApiResponse<FacultadItem>>(`${environment.apiUrl}/admin/facultades/${id}`, cambios).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._facultades.update((prev) => prev.map((f) => (f.id === id ? res.datos : f)));
        }
      })
    ).subscribe();
  }

  cambiarEstadoFacultad(id: string): void {
    this.http.patch<ApiResponse<FacultadItem>>(`${environment.apiUrl}/admin/facultades/${id}/estado`, {}).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._facultades.update((prev) => prev.map((f) => (f.id === id ? res.datos : f)));
        }
      })
    ).subscribe();
  }

  cargarAreas(): Observable<ApiResponse<AreaConocimientoItem[]>> {
    return this.http.get<ApiResponse<AreaConocimientoItem[]>>(`${environment.apiUrl}/admin/areas`).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._areas.set(res.datos);
        }
      })
    );
  }

  crearArea(item: Omit<AreaConocimientoItem, 'id'>): void {
    this.http.post<ApiResponse<AreaConocimientoItem>>(`${environment.apiUrl}/admin/areas`, item).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._areas.update((prev) => [res.datos, ...prev]);
        }
      })
    ).subscribe();
  }

  actualizarArea(id: string, cambios: Partial<AreaConocimientoItem>): void {
    this.http.put<ApiResponse<AreaConocimientoItem>>(`${environment.apiUrl}/admin/areas/${id}`, cambios).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._areas.update((prev) => prev.map((a) => (a.id === id ? res.datos : a)));
        }
      })
    ).subscribe();
  }

  cambiarEstadoArea(id: string): void {
    this.http.patch<ApiResponse<AreaConocimientoItem>>(`${environment.apiUrl}/admin/areas/${id}/estado`, {}).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._areas.update((prev) => prev.map((a) => (a.id === id ? res.datos : a)));
        }
      })
    ).subscribe();
  }

  // ================= PARÁMETROS INSTITUCIONALES =================
  cargarParametros(): Observable<ApiResponse<ParametroInstitucionalItem[]>> {
    return this.http.get<ApiResponse<ParametroInstitucionalItem[]>>(`${environment.apiUrl}/admin/parametros`).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._parametros.set(res.datos);
        }
      })
    );
  }

  actualizarParametro(id: string, nuevoValor: string): void {
    this.http.patch<ApiResponse<ParametroInstitucionalItem>>(`${environment.apiUrl}/admin/parametros/${id}`, { valor: nuevoValor }).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._parametros.update((prev) => prev.map((p) => (p.id === id ? res.datos : p)));
        }
      })
    ).subscribe();
  }

  // ================= AUDITORÍA =================
  cargarAuditoria(): Observable<ApiResponse<RegistroAuditoriaItem[]>> {
    return this.http.get<ApiResponse<RegistroAuditoriaItem[]>>(`${environment.apiUrl}/admin/auditoria`).pipe(
      tap((res) => {
        if (res.exitoso && res.datos) {
          this._auditoria.set(res.datos);
        }
      })
    );
  }

  // ================= CIERRE MASIVO =================
  ejecutarCierreMasivo(idPeriodoAcademico: string, periodoCodigo: string = ''): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/admin/cierre-masivo`, {
      idPeriodoAcademico,
      periodoCodigo,
    });
  }

  // ================= INSTITUCIONES =================
  getInstituciones(): Observable<ApiResponse<InstitucionItem[]>> {
    return this.http.get<ApiResponse<InstitucionItem[]>>(`${environment.apiUrl}/admin/instituciones`);
  }

  crearInstitucion(data: Partial<InstitucionItem>): Observable<ApiResponse<InstitucionItem>> {
    return this.http.post<ApiResponse<InstitucionItem>>(`${environment.apiUrl}/admin/instituciones`, data);
  }

  actualizarInstitucion(id: string, data: Partial<InstitucionItem>): Observable<ApiResponse<InstitucionItem>> {
    return this.http.put<ApiResponse<InstitucionItem>>(`${environment.apiUrl}/admin/instituciones/${id}`, data);
  }

  toggleEstadoInstitucion(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.http.patch<ApiResponse<{ id: string }>>(`${environment.apiUrl}/admin/instituciones/${id}/toggle-estado`, {});
  }
}
