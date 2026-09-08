import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  DocenteItem,
  PlanEstudioItem,
  AsignaturaPlanItem,
  EstudianteDirectorioItem,
  SolicitudMatriculaItem,
  PeriodoAcademicoItem,
} from '../models/role-management.model';
import {
  MOCK_DOCENTES,
  MOCK_PLANES_ESTUDIO,
  MOCK_ASIGNATURAS_PLAN,
  MOCK_ESTUDIANTES_DIRECTORIO,
  MOCK_SOLICITUDES_MATRICULA,
  MOCK_PERIODOS_ACADEMICOS,
} from '../mocks/role-management.mock';

@Injectable({
  providedIn: 'root',
})
export class CoordinatorManagementService {
  private docentesList: DocenteItem[] = [...MOCK_DOCENTES];
  private planesList: PlanEstudioItem[] = [...MOCK_PLANES_ESTUDIO];
  private asignaturasMap: Record<string, AsignaturaPlanItem[]> = { ...MOCK_ASIGNATURAS_PLAN };

  constructor(private http: HttpClient) {}

  getDocentes(): Observable<ApiResponse<DocenteItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-docentes-list',
        exitoso: true,
        total: this.docentesList.length,
        datos: [...this.docentesList],
      }).pipe(delay(350));
    }

    return this.http.get<ApiResponse<DocenteItem[]>>(`${environment.apiUrl}/coordinador/docentes`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-docentes',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar el listado de docentes.',
          datos: [],
        })
      )
    );
  }

  createDocente(nuevoDocente: Omit<DocenteItem, 'id' | 'totalGruposAsignados'>): Observable<ApiResponse<DocenteItem>> {
    const id = `DOC-${String(this.docentesList.length + 1).padStart(3, '0')}`;
    const docenteCreado: DocenteItem = {
      ...nuevoDocente,
      id,
      totalGruposAsignados: 0,
    };

    if (environment.useMocks) {
      this.docentesList = [docenteCreado, ...this.docentesList];
      return of({
        idTransaccion: 'mock-tx-docente-create',
        exitoso: true,
        mensajeUsuario: 'Docente registrado en el programa exitosamente.',
        datos: docenteCreado,
      }).pipe(delay(400));
    }

    return this.http.post<ApiResponse<DocenteItem>>(`${environment.apiUrl}/coordinador/docentes`, nuevoDocente);
  }

  toggleDocenteStatus(id: string): Observable<ApiResponse<DocenteItem | null>> {
    if (environment.useMocks) {
      const doc = this.docentesList.find((d) => d.id === id);
      if (doc) {
        doc.estado = doc.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        return of({
          idTransaccion: 'mock-tx-docente-toggle',
          exitoso: true,
          mensajeUsuario: `Estado del docente actualizado a ${doc.estado}.`,
          datos: doc,
        }).pipe(delay(250));
      }
      return of({
        idTransaccion: 'mock-tx-docente-not-found',
        exitoso: false,
        mensajeUsuario: 'Docente no encontrado.',
        datos: null,
      });
    }

    return this.http.patch<ApiResponse<DocenteItem | null>>(`${environment.apiUrl}/coordinador/docentes/${id}/estado`, {});
  }

  private planesSignal = signal<PlanEstudioItem[]>([...MOCK_PLANES_ESTUDIO]);
  private asignaturasSignal = signal<Record<string, AsignaturaPlanItem[]>>({ ...MOCK_ASIGNATURAS_PLAN });
  private periodosSignal = signal<PeriodoAcademicoItem[]>([...MOCK_PERIODOS_ACADEMICOS]);
  public periodos = this.periodosSignal.asReadonly();

  getPlanesEstudio(): Observable<ApiResponse<PlanEstudioItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-study-plans',
        exitoso: true,
        total: this.planesSignal().length,
        datos: [...this.planesSignal()],
      }).pipe(delay(200));
    }

    return this.http.get<ApiResponse<PlanEstudioItem[]>>(`${environment.apiUrl}/coordinador/planes-estudio`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-study-plans',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar los planes de estudio.',
          datos: [],
        })
      )
    );
  }

  crearPlanEstudio(datos: Partial<PlanEstudioItem>): Observable<ApiResponse<PlanEstudioItem>> {
    const id = `PLAN-${datos.codigo || Date.now()}`;
    const nuevo: PlanEstudioItem = {
      id,
      codigo: datos.codigo || 'PLAN-NUEVO',
      nombre: datos.nombre || 'Nuevo Plan de Estudio',
      anioVigencia: datos.anioVigencia || new Date().getFullYear(),
      programa: datos.programa || 'Ingeniería de Sistemas',
      facultad: datos.facultad || 'Facultad de Ingeniería',
      totalCreditos: datos.totalCreditos || 160,
      totalSemestres: datos.totalSemestres || 10,
      totalAsignaturas: 0,
      estado: datos.estado || 'VIGENTE',
      descripcion: datos.descripcion || 'Plan de estudios registrado por Coordinación.',
    };

    if (environment.useMocks) {
      this.planesSignal.update((prev) => [nuevo, ...prev]);
      this.asignaturasSignal.update((map) => ({ ...map, [id]: [] }));

      return of({
        idTransaccion: `mock-tx-plan-created-${id}`,
        exitoso: true,
        mensajeUsuario: `Plan de estudio ${nuevo.codigo} creado exitosamente.`,
        datos: nuevo,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<PlanEstudioItem>>(`${environment.apiUrl}/coordinador/planes-estudio`, nuevo);
  }

  actualizarPlanEstudio(id: string, cambios: Partial<PlanEstudioItem>): Observable<ApiResponse<PlanEstudioItem>> {
    if (environment.useMocks) {
      let actualizado: PlanEstudioItem | null = null;
      this.planesSignal.update((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            actualizado = { ...p, ...cambios };
            return actualizado;
          }
          return p;
        })
      );

      return of({
        idTransaccion: `mock-tx-plan-updated-${id}`,
        exitoso: true,
        mensajeUsuario: 'Plan de estudio modificado con éxito.',
        datos: actualizado as unknown as PlanEstudioItem,
      }).pipe(delay(250));
    }

    return this.http.put<ApiResponse<PlanEstudioItem>>(`${environment.apiUrl}/coordinador/planes-estudio/${id}`, cambios);
  }

  toggleEstadoPlanEstudio(id: string): Observable<ApiResponse<any>> {
    if (environment.useMocks) {
      let estadoNuevo: 'VIGENTE' | 'INACTIVO' = 'INACTIVO';
      this.planesSignal.update((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            estadoNuevo = p.estado === 'VIGENTE' ? 'INACTIVO' : 'VIGENTE';
            return { ...p, estado: estadoNuevo };
          }
          return p;
        })
      );

      return of({
        idTransaccion: `mock-tx-plan-toggle-${id}`,
        exitoso: true,
        mensajeUsuario: `Estado del plan actualizado a ${estadoNuevo}.`,
        datos: { id, estado: estadoNuevo },
      }).pipe(delay(200));
    }

    return this.http.patch<ApiResponse<any>>(`${environment.apiUrl}/coordinador/planes-estudio/${id}/toggle-estado`, {}).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-plan-toggle',
          exitoso: false,
          mensajeUsuario: 'No fue posible actualizar el estado del plan de estudios.',
          datos: null,
        })
      )
    );
  }

  getAsignaturasPorPlan(planId: string): Observable<ApiResponse<AsignaturaPlanItem[]>> {
    if (environment.useMocks) {
      const asignaturas = this.asignaturasSignal()[planId] || [];
      return of({
        idTransaccion: `mock-tx-subjects-${planId}`,
        exitoso: true,
        total: asignaturas.length,
        datos: [...asignaturas],
      }).pipe(delay(200));
    }

    return this.http.get<ApiResponse<AsignaturaPlanItem[]>>(`${environment.apiUrl}/coordinador/planes-estudio/${planId}/asignaturas`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-subjects-plan',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar las asignaturas del plan de estudio.',
          datos: [],
        })
      )
    );
  }

  crearAsignaturaPlan(planId: string, datos: Partial<AsignaturaPlanItem>): Observable<ApiResponse<AsignaturaPlanItem>> {
    const id = `ASIG-${Date.now()}`;
    const nueva: AsignaturaPlanItem = {
      id,
      planEstudioId: planId,
      codigo: datos.codigo || 'ASIG-001',
      nombre: datos.nombre || 'Nueva Asignatura',
      creditos: datos.creditos || 3,
      semestre: datos.semestre || 1,
      area: datos.area || 'Ciencias Básicas',
      componente: datos.componente || 'Obligatoria',
      prerrequisitos: datos.prerrequisitos || [],
      horasSemanales: datos.horasSemanales || 4,
    };

    if (environment.useMocks) {
      this.asignaturasSignal.update((map) => ({
        ...map,
        [planId]: [...(map[planId] || []), nueva],
      }));

      // Actualizar conteo de asignaturas en el plan
      this.planesSignal.update((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, totalAsignaturas: p.totalAsignaturas + 1 } : p))
      );

      return of({
        idTransaccion: `mock-tx-asig-created-${id}`,
        exitoso: true,
        mensajeUsuario: `Asignatura ${nueva.nombre} agregada al plan.`,
        datos: nueva,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<AsignaturaPlanItem>>(`${environment.apiUrl}/coordinador/planes-estudio/${planId}/asignaturas`, nueva);
  }

  actualizarAsignaturaPlan(planId: string, asigId: string, cambios: Partial<AsignaturaPlanItem>): Observable<ApiResponse<AsignaturaPlanItem>> {
    if (environment.useMocks) {
      let actualizada: AsignaturaPlanItem | null = null;
      this.asignaturasSignal.update((map) => {
        const list = map[planId] || [];
        const mod = list.map((a) => {
          if (a.id === asigId) {
            actualizada = { ...a, ...cambios };
            return actualizada;
          }
          return a;
        });
        return { ...map, [planId]: mod };
      });

      return of({
        idTransaccion: `mock-tx-asig-updated-${asigId}`,
        exitoso: true,
        mensajeUsuario: 'Asignatura actualizada exitosamente.',
        datos: actualizada as unknown as AsignaturaPlanItem,
      }).pipe(delay(250));
    }

    return this.http.put<ApiResponse<AsignaturaPlanItem>>(`${environment.apiUrl}/coordinador/planes-estudio/${planId}/asignaturas/${asigId}`, cambios);
  }

  eliminarAsignaturaPlan(planId: string, asigId: string): Observable<ApiResponse<boolean>> {
    if (environment.useMocks) {
      this.asignaturasSignal.update((map) => ({
        ...map,
        [planId]: (map[planId] || []).filter((a) => a.id !== asigId),
      }));

      this.planesSignal.update((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, totalAsignaturas: Math.max(0, p.totalAsignaturas - 1) } : p))
      );

      return of({
        idTransaccion: `mock-tx-asig-deleted-${asigId}`,
        exitoso: true,
        mensajeUsuario: 'Asignatura desvinculada del plan de estudio.',
        datos: true,
      }).pipe(delay(250));
    }

    return this.http.delete<ApiResponse<boolean>>(`${environment.apiUrl}/coordinador/planes-estudio/${planId}/asignaturas/${asigId}`);
  }

  // --- PERÍODOS ACADÉMICOS ---
  getPeriodosAcademicos(): Observable<ApiResponse<PeriodoAcademicoItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-periodos-academicos',
        exitoso: true,
        total: this.periodosSignal().length,
        datos: [...this.periodosSignal()],
      }).pipe(delay(200));
    }

    return this.http.get<ApiResponse<PeriodoAcademicoItem[]>>(`${environment.apiUrl}/coordinador/periodos-academicos`);
  }

  crearPeriodoAcademico(datos: Partial<PeriodoAcademicoItem>): Observable<ApiResponse<PeriodoAcademicoItem>> {
    const id = `PER-${datos.codigo || Date.now()}`;
    const nuevo: PeriodoAcademicoItem = {
      id,
      codigo: datos.codigo || '2027-1',
      nombre: datos.nombre || `Período ${datos.codigo || '2027-1'}`,
      fechaInicio: datos.fechaInicio || '2027-02-01',
      fechaFin: datos.fechaFin || '2027-06-20',
      fechaLimiteNotas: datos.fechaLimiteNotas || '2027-06-25',
      estado: datos.estado || 'PLANEACION',
      esActual: false,
    };

    if (environment.useMocks) {
      this.periodosSignal.update((prev) => [nuevo, ...prev]);
      return of({
        idTransaccion: `mock-tx-create-period-${id}`,
        exitoso: true,
        mensajeUsuario: `Período académico ${nuevo.codigo} creado exitosamente.`,
        datos: nuevo,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<PeriodoAcademicoItem>>(`${environment.apiUrl}/coordinador/periodos-academicos`, nuevo);
  }

  actualizarPeriodoAcademico(id: string, cambios: Partial<PeriodoAcademicoItem>): Observable<ApiResponse<PeriodoAcademicoItem>> {
    if (environment.useMocks) {
      let modificado: PeriodoAcademicoItem | null = null;
      this.periodosSignal.update((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            modificado = { ...p, ...cambios };
            return modificado;
          }
          return p;
        })
      );

      return of({
        idTransaccion: `mock-tx-update-period-${id}`,
        exitoso: true,
        mensajeUsuario: 'Parámetros del período académico actualizados.',
        datos: modificado as unknown as PeriodoAcademicoItem,
      }).pipe(delay(250));
    }

    return this.http.put<ApiResponse<PeriodoAcademicoItem>>(`${environment.apiUrl}/coordinador/periodos-academicos/${id}`, cambios);
  }

  toggleEstadoPeriodoAcademico(id: string): Observable<ApiResponse<any>> {
    if (environment.useMocks) {
      return of({ idTransaccion: 'mock-tx-toggle-per', exitoso: true, datos: { id, estado: 'ACTIVO' } });
    }
    return this.http.patch<ApiResponse<any>>(`${environment.apiUrl}/coordinador/periodos-academicos/${id}/estado`, {});
  }

  agregarSemestrePlan(planId: string): Observable<ApiResponse<any>> {
    if (environment.useMocks) {
      return of({ idTransaccion: 'mock-tx-add-sem', exitoso: true, datos: { planEstudioId: planId } });
    }
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/coordinador/planes-estudio/${planId}/semestres`, {});
  }

  eliminarSemestrePlan(planId: string, semestreNumero: number): Observable<ApiResponse<any>> {
    if (environment.useMocks) {
      return of({ idTransaccion: 'mock-tx-del-sem', exitoso: true, datos: { planEstudioId: planId, semestreEliminado: semestreNumero } });
    }
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/coordinador/planes-estudio/${planId}/semestres/${semestreNumero}`);
  }

  // --- DIRECTORIO INSTITUCIONAL DE ESTUDIANTES ---
  private estudiantesSignal = signal<EstudianteDirectorioItem[]>([...MOCK_ESTUDIANTES_DIRECTORIO]);
  private solicitudesMatriculaSignal = signal<SolicitudMatriculaItem[]>([...MOCK_SOLICITUDES_MATRICULA]);

  getEstudiantesDirectorio(): Observable<ApiResponse<EstudianteDirectorioItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-estudiantes-dir',
        exitoso: true,
        total: this.estudiantesSignal().length,
        datos: [...this.estudiantesSignal()],
      }).pipe(delay(250));
    }

    return this.http.get<ApiResponse<EstudianteDirectorioItem[]>>(`${environment.apiUrl}/coordinador/estudiantes`).pipe(
      catchError(() =>
        of({
          idTransaccion: 'error-estudiantes-dir',
          exitoso: false,
          mensajeUsuario: 'No fue posible cargar el directorio estudiantil.',
          datos: [],
        })
      )
    );
  }

  getEstudiantesPorGrupo(grupoId: string): Observable<ApiResponse<EstudianteDirectorioItem[]>> {
    if (environment.useMocks) {
      const filtrados = this.estudiantesSignal().filter((e) =>
        e.gruposInscritos && e.gruposInscritos.includes(grupoId)
      );
      return of({
        idTransaccion: `mock-tx-estudiantes-grp-${grupoId}`,
        exitoso: true,
        total: filtrados.length,
        datos: [...filtrados],
      }).pipe(delay(200));
    }

    return this.http.get<ApiResponse<EstudianteDirectorioItem[]>>(`${environment.apiUrl}/grupos/${grupoId}/estudiantes`);
  }

  matricularEstudianteGrupo(grupoId: string, estudianteId: string): Observable<ApiResponse<boolean>> {
    if (environment.useMocks) {
      this.estudiantesSignal.update((prev) =>
        prev.map((e) => {
          if (e.id === estudianteId) {
            const grupos = new Set(e.gruposInscritos || []);
            grupos.add(grupoId);
            return { ...e, gruposInscritos: Array.from(grupos) };
          }
          return e;
        })
      );

      return of({
        idTransaccion: `mock-tx-enroll-${estudianteId}`,
        exitoso: true,
        mensajeUsuario: 'Estudiante matriculado exitosamente en el grupo.',
        datos: true,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<boolean>>(`${environment.apiUrl}/grupos/${grupoId}/estudiantes`, { estudianteId });
  }

  retirarEstudianteGrupo(grupoId: string, estudianteId: string): Observable<ApiResponse<boolean>> {
    if (environment.useMocks) {
      this.estudiantesSignal.update((prev) =>
        prev.map((e) => {
          if (e.id === estudianteId) {
            return {
              ...e,
              gruposInscritos: (e.gruposInscritos || []).filter((g) => g !== grupoId),
            };
          }
          return e;
        })
      );

      return of({
        idTransaccion: `mock-tx-unroll-${estudianteId}`,
        exitoso: true,
        mensajeUsuario: 'Estudiante retirado del grupo académico.',
        datos: true,
      }).pipe(delay(250));
    }

    return this.http.delete<ApiResponse<boolean>>(`${environment.apiUrl}/grupos/${grupoId}/estudiantes/${estudianteId}`);
  }

  // --- SOLICITUDES DE INSCRIPCIÓN Y CUPO ---
  getSolicitudesMatricula(): Observable<ApiResponse<SolicitudMatriculaItem[]>> {
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-solicitudes-matricula',
        exitoso: true,
        total: this.solicitudesMatriculaSignal().length,
        datos: [...this.solicitudesMatriculaSignal()],
      }).pipe(delay(250));
    }

    return this.http.get<ApiResponse<SolicitudMatriculaItem[]>>(`${environment.apiUrl}/coordinador/solicitudes-matricula`);
  }

  crearSolicitudMatricula(
    solicitud: Omit<SolicitudMatriculaItem, 'id' | 'fechaSolicitud' | 'estado'>
  ): Observable<ApiResponse<SolicitudMatriculaItem>> {
    const id = `SOL-MAT-${String(this.solicitudesMatriculaSignal().length + 1).padStart(3, '0')}`;
    const nueva: SolicitudMatriculaItem = {
      ...solicitud,
      id,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: 'PENDIENTE',
    };

    if (environment.useMocks) {
      this.solicitudesMatriculaSignal.update((prev) => [nueva, ...prev]);
      return of({
        idTransaccion: `mock-tx-crear-sol-mat-${id}`,
        exitoso: true,
        mensajeUsuario: `Tu solicitud de inscripción a ${nueva.cursoNombre} ha sido enviada a Coordinación.`,
        datos: nueva,
      }).pipe(delay(250));
    }

    return this.http.post<ApiResponse<SolicitudMatriculaItem>>(`${environment.apiUrl}/estudiante/solicitudes-matricula`, solicitud);
  }

  resolverSolicitudMatricula(
    id: string,
    accion: 'APROBADA' | 'RECHAZADA',
    respuesta?: string
  ): Observable<ApiResponse<SolicitudMatriculaItem>> {
    if (environment.useMocks) {
      let actualizada: SolicitudMatriculaItem | null = null;
      this.solicitudesMatriculaSignal.update((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            actualizada = {
              ...s,
              estado: accion,
              respuestaCoordinador: respuesta || (accion === 'APROBADA' ? 'Cupo asignado satisfactoriamente.' : 'No fue posible autorizar el cupo en este grupo.'),
              fechaRespuesta: new Date().toISOString().split('T')[0],
            };
            return actualizada;
          }
          return s;
        })
      );

      // Si fue aprobada, matricularlo automáticamente en el grupo
      if (accion === 'APROBADA' && actualizada) {
        const item = actualizada as SolicitudMatriculaItem;
        this.matricularEstudianteGrupo(item.cursoId, item.estudianteId).subscribe();
      }

      return of({
        idTransaccion: `mock-tx-resolver-sol-${id}`,
        exitoso: true,
        mensajeUsuario: `Solicitud ${accion.toLowerCase()} correctamente.`,
        datos: actualizada as unknown as SolicitudMatriculaItem,
      }).pipe(delay(250));
    }

    return this.http.patch<ApiResponse<SolicitudMatriculaItem>>(`${environment.apiUrl}/coordinador/solicitudes-matricula/${id}`, {
      accion,
      respuesta,
    });
  }
}
