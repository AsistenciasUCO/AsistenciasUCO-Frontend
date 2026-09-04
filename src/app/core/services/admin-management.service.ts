import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
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
} from '../models/role-management.model';
import {
  MOCK_DECANOS,
  MOCK_SEDES,
  MOCK_ESPACIOS_FISICOS,
  MOCK_FACULTADES,
  MOCK_AREAS_CONOCIMIENTO,
  MOCK_PARAMETROS,
  MOCK_REGISTROS_AUDITORIA,
  MOCK_REPORTES_CIERRE,
} from '../mocks/role-management.mock';

@Injectable({
  providedIn: 'root',
})
export class AdminManagementService {
  private decanosList: DecanoItem[] = [...MOCK_DECANOS];

  constructor(private http: HttpClient) {}

  // ================= DECANOS =================
  getDecanos(): Observable<ApiResponse<DecanoItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-decanos-list',
        exitoso: true,
        total: this.decanosList.length,
        datos: [...this.decanosList],
      }).pipe(delay(300));
    }

    return this.http.get<ApiResponse<DecanoItem[]>>(`${environment.apiUrl}/admin/decanos`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-decanos',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar la lista de decanos.',
          datos: [],
        })
      )
    );
  }

  createDecano(nuevoDecano: Omit<DecanoItem, 'id'>): Observable<ApiResponse<DecanoItem>> {
    const id = `DEC-${String(this.decanosList.length + 1).padStart(3, '0')}`;
    const decanoCreado: DecanoItem = {
      ...nuevoDecano,
      id,
    };

    if (environment.useMocks) {
      this.decanosList = [decanoCreado, ...this.decanosList];
      this.registrarAuditoria({
        modulo: 'USUARIOS',
        accion: 'CREAR',
        descripcion: `Se registró al decano ${decanoCreado.nombres} ${decanoCreado.apellidos}`,
        nivel: 'INFO',
      });
      return of({
        idTransaccion: 'mock-tx-decano-create',
        exitoso: true,
        mensajeUsuario: 'Decano registrado exitosamente.',
        datos: decanoCreado,
      }).pipe(delay(350));
    }

    return this.http.post<ApiResponse<DecanoItem>>(`${environment.apiUrl}/admin/decanos`, nuevoDecano);
  }

  toggleDecanoStatus(id: string): Observable<ApiResponse<DecanoItem | null>> {
    if (environment.useMocks) {
      const decano = this.decanosList.find((d) => d.id === id);
      if (decano) {
        decano.estado = decano.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.registrarAuditoria({
          modulo: 'USUARIOS',
          accion: 'ACTUALIZAR',
          descripcion: `Se cambió el estado del decano ${decano.nombres} a ${decano.estado}`,
          nivel: 'INFO',
        });
        return of({
          idTransaccion: 'mock-tx-decano-toggle',
          exitoso: true,
          mensajeUsuario: `Estado del decano actualizado a ${decano.estado}.`,
          datos: { ...decano },
        }).pipe(delay(200));
      }
      return of({
        idTransaccion: 'mock-tx-decano-not-found',
        exitoso: false,
        mensajeUsuario: 'Decano no encontrado.',
        datos: null,
      });
    }

    return this.http.patch<ApiResponse<DecanoItem>>(`${environment.apiUrl}/admin/decanos/${id}/toggle`, {});
  }

  // Sedes (HU147 - HU150)
  private _sedes = signal<SedeInstitucionalItem[]>(MOCK_SEDES);
  sedes = this._sedes.asReadonly();

  // Espacios Físicos (HU151 - HU155)
  private _espacios = signal<EspacioFisicoItem[]>(MOCK_ESPACIOS_FISICOS);
  espacios = this._espacios.asReadonly();

  // Facultades (HU161 - HU164)
  private _facultades = signal<FacultadItem[]>(MOCK_FACULTADES);
  facultades = this._facultades.asReadonly();

  // Áreas de Conocimiento (HU165 - HU167)
  private _areas = signal<AreaConocimientoItem[]>(MOCK_AREAS_CONOCIMIENTO);
  areas = this._areas.asReadonly();

  // Parámetros Institucionales (HU168, HU169)
  private _parametros = signal<ParametroInstitucionalItem[]>(MOCK_PARAMETROS);
  parametros = this._parametros.asReadonly();

  // Auditoría (HU170 - HU172)
  private _auditoria = signal<RegistroAuditoriaItem[]>(MOCK_REGISTROS_AUDITORIA);
  auditoria = this._auditoria.asReadonly();

  // Reportes Cierre Masivo (HU173, HU174)
  private _reportesCierre = signal<CierrePeriodoReporte[]>(MOCK_REPORTES_CIERRE);
  reportesCierre = this._reportesCierre.asReadonly();

  // ================= SEDES =================
  crearSede(item: Omit<SedeInstitucionalItem, 'id'>): void {
    const nueva: SedeInstitucionalItem = {
      ...item,
      id: `SED-${Date.now()}`,
    };
    this._sedes.update((prev) => [nueva, ...prev]);
    this.registrarAuditoria({
      modulo: 'SISTEMA',
      accion: 'CREAR',
      descripcion: `Se creó la sede ${nueva.nombre} (${nueva.codigo})`,
      nivel: 'INFO',
    });
  }

  actualizarSede(id: string, cambios: Partial<SedeInstitucionalItem>): void {
    this._sedes.update((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...cambios } : s))
    );
    this.registrarAuditoria({
      modulo: 'SISTEMA',
      accion: 'ACTUALIZAR',
      descripcion: `Se actualizó la sede con ID ${id}`,
      nivel: 'INFO',
    });
  }

  cambiarEstadoSede(id: string): void {
    this._sedes.update((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, estado: s.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' }
          : s
      )
    );
  }

  // ================= ESPACIOS FÍSICOS =================
  crearEspacio(item: Omit<EspacioFisicoItem, 'id'>): void {
    const sede = this._sedes().find((s) => s.id === item.sedeId);
    const nuevo: EspacioFisicoItem = {
      ...item,
      id: `ESP-${Date.now()}`,
      sedeNombre: sede ? sede.nombre : item.sedeNombre,
    };
    this._espacios.update((prev) => [nuevo, ...prev]);
    this.registrarAuditoria({
      modulo: 'SISTEMA',
      accion: 'CREAR',
      descripcion: `Se creó el espacio físico ${nuevo.codigo} en ${nuevo.sedeNombre}`,
      nivel: 'INFO',
    });
  }

  actualizarEspacio(id: string, cambios: Partial<EspacioFisicoItem>): void {
    this._espacios.update((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...cambios } : e))
    );
    this.registrarAuditoria({
      modulo: 'SISTEMA',
      accion: 'ACTUALIZAR',
      descripcion: `Se actualizaron las propiedades del espacio con ID ${id}`,
      nivel: 'INFO',
    });
  }

  // ================= FACULTADES Y ÁREAS =================
  crearFacultad(item: Omit<FacultadItem, 'id'>): void {
    const nueva: FacultadItem = {
      ...item,
      id: `FAC-${Date.now()}`,
    };
    this._facultades.update((prev) => [nueva, ...prev]);
    this.registrarAuditoria({
      modulo: 'PLANES_ESTUDIO',
      accion: 'CREAR',
      descripcion: `Se registró la facultad ${nueva.nombre} (${nueva.codigo})`,
      nivel: 'INFO',
    });
  }

  actualizarFacultad(id: string, cambios: Partial<FacultadItem>): void {
    this._facultades.update((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...cambios } : f))
    );
  }

  crearArea(item: Omit<AreaConocimientoItem, 'id'>): void {
    const facultad = this._facultades().find((f) => f.id === item.facultadId);
    const nueva: AreaConocimientoItem = {
      ...item,
      id: `AREA-${Date.now()}`,
      facultadNombre: facultad ? facultad.nombre : item.facultadNombre,
    };
    this._areas.update((prev) => [nueva, ...prev]);
    this.registrarAuditoria({
      modulo: 'PLANES_ESTUDIO',
      accion: 'CREAR',
      descripcion: `Se registró el área de conocimiento ${nueva.nombre}`,
      nivel: 'INFO',
    });
  }

  actualizarArea(id: string, cambios: Partial<AreaConocimientoItem>): void {
    this._areas.update((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...cambios } : a))
    );
  }

  // ================= PARÁMETROS INSTITUCIONALES =================
  actualizarParametro(id: string, nuevoValor: string): void {
    let paramNombre = '';
    this._parametros.update((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          paramNombre = p.nombre;
          return {
            ...p,
            valor: nuevoValor,
            ultimaModificacion: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return p;
      })
    );
    this.registrarAuditoria({
      modulo: 'SISTEMA',
      accion: 'ACTUALIZAR',
      descripcion: `Se actualizó el parámetro institucional ${paramNombre} a "${nuevoValor}"`,
      nivel: 'WARNING',
    });
  }

  // ================= AUDITORÍA =================
  registrarAuditoria(evento: {
    modulo: 'ASISTENCIA' | 'NOTAS' | 'MATRICULA' | 'PLANES_ESTUDIO' | 'USUARIOS' | 'SISTEMA';
    accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'CIERRE_MASIVO' | 'APROBACION';
    descripcion: string;
    nivel: 'INFO' | 'WARNING' | 'CRITICO';
  }): void {
    const item: RegistroAuditoriaItem = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      usuarioId: 'ADMIN-ACTUAL',
      usuarioNombre: 'Administrador del Sistema',
      rol: 'ADMINISTRADOR',
      modulo: evento.modulo,
      accion: evento.accion,
      descripcion: evento.descripcion,
      direccionIp: '10.0.0.1',
      nivel: evento.nivel,
    };
    this._auditoria.update((prev) => [item, ...prev]);
  }

  // ================= CIERRE MASIVO (HU173, HU174) =================
  ejecutarCierreMasivo(periodoCodigo: string): CierrePeriodoReporte {
    const nuevoReporte: CierrePeriodoReporte = {
      id: `REP-CIE-${Date.now()}`,
      periodoCodigo,
      fechaEjecucion: new Date().toISOString().replace('T', ' ').slice(0, 19),
      totalEstudiantesProcesados: 1540,
      totalMateriasAfectadas: 92,
      totalAprobadosAsistencia: 1492,
      totalReprobadosFallas: 48,
      estado: 'COMPLETADO',
      ejecutadoPor: 'Administrador del Sistema',
    };
    this._reportesCierre.update((prev) => [nuevoReporte, ...prev]);
    this.registrarAuditoria({
      modulo: 'ASISTENCIA',
      accion: 'CIERRE_MASIVO',
      descripcion: `Ejecución de cierre masivo de asistencia para el período ${periodoCodigo}. ${nuevoReporte.totalEstudiantesProcesados} estudiantes procesados, ${nuevoReporte.totalReprobadosFallas} reprobados por inasistencia.`,
      nivel: 'CRITICO',
    });
    return nuevoReporte;
  }
}
