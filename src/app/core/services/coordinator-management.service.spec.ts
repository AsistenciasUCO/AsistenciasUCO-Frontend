import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CoordinatorManagementService } from './coordinator-management.service';
import { environment } from '../../../environments/environment';
import {
  DocenteItem,
  PlanEstudioItem,
  AsignaturaPlanItem,
  EstudianteDirectorioItem,
  SolicitudMatriculaItem,
  PeriodoAcademicoItem,
} from '../models/role-management.model';

describe('CoordinatorManagementService', () => {
  let service: CoordinatorManagementService;
  let http: HttpTestingController;

  const mockPlanes: PlanEstudioItem[] = [
    {
      id: 'plan-1',
      codigo: 'ISI-2026',
      nombre: 'Ingeniería de Sistemas',
      version: 'v2',
      fechaAprobacion: '2026-01-01',
      estado: 'ACTIVO',
      totalAsignaturas: 50,
      totalSemestres: 10,
      creditosTotales: 160,
    },
  ];

  const mockPeriodos: PeriodoAcademicoItem[] = [
    {
      id: 'per-1',
      codigo: '2026-1',
      nombre: 'Primer Semestre 2026',
      fechaInicio: '2026-02-01',
      fechaFin: '2026-06-30',
      estado: 'ACTIVO',
      semanasLectivas: 16,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoordinatorManagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoordinatorManagementService);
    http = TestBed.inject(HttpTestingController);

    // Responder a las llamadas iniciales del constructor
    const reqPlanes = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio`);
    reqPlanes.flush({ exitoso: true, datos: mockPlanes });

    const reqPeriodos = http.expectOne(`${environment.apiUrl}/coordinador/periodos-academicos`);
    reqPeriodos.flush({ exitoso: true, datos: mockPeriodos });
  });

  afterEach(() => http.verify());

  it('debe crearse e inicializar señales de planes y periodos', () => {
    expect(service).toBeTruthy();
    expect(service.planes().length).toBe(1);
    expect(service.periodos().length).toBe(1);
  });

  describe('Docentes', () => {
    it('getDocentes obtiene la lista de docentes', () => {
      const mockDocentes: DocenteItem[] = [
        {
          id: 'doc-1',
          numeroIdentificacion: '1017001',
          nombres: 'Pedro',
          apellidos: 'Pérez',
          correo: 'pperez@uco.edu.co',
          telefono: '5698000',
          departamento: 'Ingeniería',
          tipoContrato: 'TIEMPO_COMPLETO',
          estado: 'ACTIVO',
          totalGruposAsignados: 3,
        },
      ];

      service.getDocentes().subscribe((res) => {
        expect(res.exitoso).toBeTrue();
        expect(res.datos?.length).toBe(1);
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/docentes`);
      expect(req.request.method).toBe('GET');
      req.flush({ exitoso: true, datos: mockDocentes });
    });

    it('createDocente envía POST y retorna el nuevo docente', () => {
      const nuevo = {
        numeroIdentificacion: '1017002',
        nombres: 'Luisa',
        apellidos: 'Castro',
        correo: 'lcastro@uco.edu.co',
        telefono: '5698001',
        departamento: 'Ingeniería',
        tipoContrato: 'CATEDRA' as const,
        estado: 'ACTIVO' as const,
      };

      service.createDocente(nuevo).subscribe((res) => {
        expect(res.exitoso).toBeTrue();
        expect(res.datos?.nombres).toBe('Luisa');
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/docentes`);
      expect(req.request.method).toBe('POST');
      req.flush({ exitoso: true, datos: { id: 'doc-2', ...nuevo, totalGruposAsignados: 0 } });
    });

    it('toggleDocenteStatus envía PATCH para alternar estado', () => {
      service.toggleDocenteStatus('doc-1').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/docentes/doc-1/toggle`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ exitoso: true, datos: null });
    });
  });

  describe('Planes de Estudio y Asignaturas', () => {
    it('crearPlanEstudio agrega el nuevo plan a la señal', () => {
      const nuevoPlan: Partial<PlanEstudioItem> = {
        codigo: 'MED-2026',
        nombre: 'Medicina',
        version: 'v1',
        estado: 'ACTIVO',
        totalAsignaturas: 60,
      };

      service.crearPlanEstudio(nuevoPlan).subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio`);
      expect(req.request.method).toBe('POST');
      req.flush({ exitoso: true, datos: { id: 'plan-2', ...nuevoPlan } });

      expect(service.planes().length).toBe(2);
      expect(service.planes()[0].id).toBe('plan-2');
    });

    it('actualizarPlanEstudio modifica el plan en la señal', () => {
      service.actualizarPlanEstudio('plan-1', { nombre: 'Ingeniería de Software' }).subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio/plan-1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ exitoso: true, datos: { ...mockPlanes[0], nombre: 'Ingeniería de Software' } });

      expect(service.planes().find((p) => p.id === 'plan-1')?.nombre).toBe('Ingeniería de Software');
    });

    it('toggleEstadoPlanEstudio actualiza el estado en la señal', () => {
      service.toggleEstadoPlanEstudio('plan-1').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio/plan-1/toggle`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ exitoso: true, datos: { ...mockPlanes[0], estado: 'INACTIVO' } });

      expect(service.planes().find((p) => p.id === 'plan-1')?.estado).toBe('INACTIVO');
    });

    it('getAsignaturasPorPlan actualiza las asignaturas del plan', () => {
      const mockAsigs: AsignaturaPlanItem[] = [
        {
          id: 'asig-1',
          codigo: 'MAT101',
          nombre: 'Cálculo Diferencial',
          semestre: 1,
          creditos: 3,
          horasSemanales: 4,
          componente: 'Obligatoria',
          areaFormacion: 'Ciencias Básicas',
        },
      ];

      service.getAsignaturasPorPlan('plan-1').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio/plan-1/asignaturas`);
      expect(req.request.method).toBe('GET');
      req.flush({ exitoso: true, datos: mockAsigs });

      expect(service.getAsignaturasPlan('plan-1').length).toBe(1);
    });

    it('crearAsignaturaPlan agrega una asignatura y actualiza el contador de asignaturas del plan', () => {
      const nuevaAsig: Partial<AsignaturaPlanItem> = {
        codigo: 'PRG101',
        nombre: 'Programación I',
        semestre: 1,
        creditos: 3,
      };

      service.crearAsignaturaPlan('plan-1', nuevaAsig).subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio/plan-1/asignaturas`);
      expect(req.request.method).toBe('POST');
      req.flush({ exitoso: true, datos: { id: 'asig-2', ...nuevaAsig } });

      const plan = service.planes().find((p) => p.id === 'plan-1');
      expect(plan?.totalAsignaturas).toBe(51);
    });

    it('eliminarAsignaturaPlan remueve la asignatura y decrementa el contador', () => {
      service.eliminarAsignaturaPlan('plan-1', 'asig-1').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/planes-estudio/plan-1/asignaturas/asig-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ exitoso: true, datos: true });

      const plan = service.planes().find((p) => p.id === 'plan-1');
      expect(plan?.totalAsignaturas).toBe(49);
    });
  });

  describe('Estudiantes y Matrículas', () => {
    it('getEstudiantesDirectorio consulta el directorio institucional', () => {
      const mockEstudiantes: EstudianteDirectorioItem[] = [
        {
          id: 'est-1',
          documento: '1017009',
          nombreCompleto: 'Laura Restrepo',
          correo: 'lrestrepo@uco.edu.co',
          programa: 'Ingeniería de Sistemas',
          semestre: 4,
          promedio: 4.5,
          estadoMatricula: 'ACTIVO',
          gruposInscritos: ['grp-1'],
        },
      ];

      service.getEstudiantesDirectorio().subscribe((res) => {
        expect(res.exitoso).toBeTrue();
        expect(res.datos?.length).toBe(1);
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/estudiantes`);
      expect(req.request.method).toBe('GET');
      req.flush({ exitoso: true, datos: mockEstudiantes });

      expect(service.estudiantes().length).toBe(1);
    });

    it('matricularEstudianteGrupo registra al estudiante en el grupo', () => {
      service.matricularEstudianteGrupo('grp-2', 'est-1').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/grupos/grp-2/estudiantes`);
      expect(req.request.method).toBe('POST');
      req.flush({ exitoso: true, datos: true });
    });

    it('retirarEstudianteGrupo retira al estudiante del grupo', () => {
      service.retirarEstudianteGrupo('grp-1', 'est-1').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/grupos/grp-1/estudiantes/est-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ exitoso: true, datos: true });
    });
  });

  describe('Solicitudes de Matrícula', () => {
    it('getSolicitudesMatricula obtiene las solicitudes pendientes', () => {
      const mockSolicitudes: SolicitudMatriculaItem[] = [
        {
          id: 'sol-1',
          estudianteId: 'est-1',
          estudianteNombre: 'Laura Restrepo',
          estudianteDocumento: '1017009',
          cursoId: 'cur-1',
          materiaNombre: 'Cálculo',
          grupoCodigo: 'G01',
          fechaSolicitud: '2026-02-05',
          estado: 'PENDIENTE',
          motivo: 'Cruce de horario',
        },
      ];

      service.getSolicitudesMatricula().subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/solicitudes-matricula`);
      expect(req.request.method).toBe('GET');
      req.flush({ exitoso: true, datos: mockSolicitudes });

      expect(service.solicitudesMatricula().length).toBe(1);
    });

    it('resolverSolicitudMatricula actualiza la solicitud en la señal', () => {
      service.resolverSolicitudMatricula('sol-1', 'APROBADA', 'Aprobado sin conflicto').subscribe((res) => {
        expect(res.exitoso).toBeTrue();
      });

      const req = http.expectOne(`${environment.apiUrl}/coordinador/solicitudes-matricula/sol-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({
        exitoso: true,
        datos: {
          id: 'sol-1',
          estudianteId: 'est-1',
          estudianteNombre: 'Laura Restrepo',
          estudianteDocumento: '1017009',
          cursoId: 'cur-1',
          materiaNombre: 'Cálculo',
          grupoCodigo: 'G01',
          fechaSolicitud: '2026-02-05',
          estado: 'APROBADA',
          motivo: 'Cruce de horario',
          respuestaCoordinador: 'Aprobado sin conflicto',
        },
      });
    });
  });
});
