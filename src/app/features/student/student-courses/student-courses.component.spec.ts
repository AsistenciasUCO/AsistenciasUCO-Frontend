import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { StudentCoursesComponent } from './student-courses.component';
import { StudentManagementService } from '../../../core/services/student-management.service';
import { AttendanceClaimService } from '../../../core/services/attendance-claim.service';
import { AuthService } from '../../../core/services/auth.service';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CourseService } from '../../../core/services/course.service';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { SOPORTE_MAX_BYTES } from '../../../core/files/soporte-file.validator';
import { MateriaEstudianteItem, SesionMateriaDetalle } from '../../../core/models/role-management.model';

function archivo(name: string, size: number, type: string): File {
  const file = new File([new Uint8Array(Math.min(size, 8))], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function evento(file: File | null): { event: Event; input: HTMLInputElement } {
  const input = { files: file ? [file] : [], value: 'C:\\fakepath\\x' } as unknown as HTMLInputElement;
  return { event: { target: input } as unknown as Event, input };
}

describe('StudentCoursesComponent — soporte y radicación (LB-004D FE-01..FE-05)', () => {
  let component: StudentCoursesComponent;
  let claims: jasmine.SpyObj<AttendanceClaimService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    claims = jasmine.createSpyObj<AttendanceClaimService>('AttendanceClaimService', [
      'subirSoporte', 'crearReclamo', 'getSesionesPorMateria', 'eliminarReclamo',
    ]);
    claims.getSesionesPorMateria.and.returnValue(of({ exitoso: true, datos: [] }) as never);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'warning', 'info']);

    TestBed.configureTestingModule({
      imports: [StudentCoursesComponent],
      providers: [
        { provide: AttendanceClaimService, useValue: claims },
        { provide: ToastService, useValue: toast },
        { provide: StudentManagementService, useValue: { getMaterias: () => of({ exitoso: true, datos: [] }) } },
        { provide: AuthService, useValue: { currentUser: () => ({ id: 'u-1', name: 'Ana', email: 'ana@uco.edu.co' }) } },
        { provide: CoordinatorManagementService, useValue: {} },
        { provide: CourseService, useValue: {} },
        { provide: SessionService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    });
    component = TestBed.createComponent(StudentCoursesComponent).componentInstance;
    component.selectedMateria.set({ id: 'm-1', codigo: 'MAT1', nombre: 'Mate', grupo: 'G1' } as never);
    component.sesionReclamar.set({ id: 's-1', numeroSesion: 3, fecha: '2026-10-19', estadoAsistencia: 'AUSENTE' } as never);
  });

  it('FE-01/02: rechaza un tipo no permitido y un archivo > 5 MiB sin llamar al backend', () => {
    component.onFileSelected(evento(archivo('virus.exe', 10, 'application/x-msdownload')).event);
    expect(claims.subirSoporte).not.toHaveBeenCalled();
    expect(component.errorSoporte()).toContain('Formato no permitido');

    component.onFileSelected(evento(archivo('grande.pdf', SOPORTE_MAX_BYTES + 1, 'application/pdf')).event);
    expect(claims.subirSoporte).not.toHaveBeenCalled();
    expect(component.errorSoporte()).toContain('5 MB');
    expect(component.archivoAdjunto()).toBeNull();
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it('FE-03: sube un soporte válido, guarda el fileId y limpia el input para poder reelegir el mismo archivo', () => {
    claims.subirSoporte.and.returnValue(of({ exitoso: true, datos: { fileId: 'f-1', nombre: 'a.pdf', url: '/api/v1/archivos/f-1', tamanio: 2048 } }) as never);
    const { event, input } = evento(archivo('a.pdf', 2048, 'application/pdf'));
    component.onFileSelected(event);

    expect(claims.subirSoporte).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('');
    expect(component.archivoAdjunto()?.fileId).toBe('f-1');
    expect(component.archivoAdjunto()?.urlSimulada).toBe('/api/v1/archivos/f-1');
    expect(component.subiendoSoporte()).toBeFalse();
    expect(component.errorSoporte()).toBeNull();
  });

  it('mientras sube, ignora una segunda selección y bloquea la radicación', () => {
    const pendiente = new Subject<never>();
    claims.subirSoporte.and.returnValue(pendiente.asObservable() as never);
    component.onFileSelected(evento(archivo('a.pdf', 10, 'application/pdf')).event);
    component.onFileSelected(evento(archivo('b.pdf', 10, 'application/pdf')).event);
    component.enviarReclamo({ categoria: 'Otro', justificacion: 'motivo' });

    expect(component.subiendoSoporte()).toBeTrue();
    expect(claims.subirSoporte).toHaveBeenCalledTimes(1);
    expect(claims.crearReclamo).not.toHaveBeenCalled();
  });

  it('quitar el adjunto durante la subida cancela la petición en vuelo', () => {
    const pendiente = new Subject<never>();
    claims.subirSoporte.and.returnValue(pendiente.asObservable() as never);
    component.onFileSelected(evento(archivo('a.pdf', 10, 'application/pdf')).event);
    expect(pendiente.observed).toBeTrue();
    component.removerAdjunto();

    expect(pendiente.observed).toBeFalse();
    expect(component.subiendoSoporte()).toBeFalse();
    expect(component.archivoAdjunto()).toBeNull();
  });

  it('FE-04: mensajes distintos para sesión vencida, malware/validación, red y servicio caído', () => {
    const mensajes = new Set<string>();
    for (const status of [401, 400, 0, 503]) {
      claims.subirSoporte.and.returnValue(throwError(() => new HttpErrorResponse({
        status,
        error: status === 400 ? { timestamp: 't', status, error: 'Bad Request', code: 'VALIDATION_ERROR', message: 'El archivo fue rechazado: se detecto una firma de malware conocida.', path: '/x', correlationId: null } : null,
      })));
      component.onFileSelected(evento(archivo('a.pdf', 10, 'application/pdf')).event);
      mensajes.add(component.errorSoporte() ?? '');
    }
    expect(mensajes.size).toBe(4);
    expect([...mensajes].some((m) => m.includes('rechazado'))).toBeTrue();
    expect(component.archivoAdjunto()).toBeNull();
  });

  it('FE-05: radica con el soporte fileId y no duplica el envío mientras está en curso', () => {
    claims.subirSoporte.and.returnValue(of({ exitoso: true, datos: { fileId: 'f-1', nombre: 'a.pdf', url: '/api/v1/archivos/f-1', tamanio: 10 } }) as never);
    component.onFileSelected(evento(archivo('a.pdf', 10, 'application/pdf')).event);
    const respuesta = new Subject<never>();
    claims.crearReclamo.and.returnValue(respuesta.asObservable() as never);
    component.enviarReclamo({ categoria: 'Otro', justificacion: 'motivo' });
    component.enviarReclamo({ categoria: 'Otro', justificacion: 'motivo' });

    expect(claims.crearReclamo).toHaveBeenCalledTimes(1);
    expect(claims.crearReclamo.calls.mostRecent().args[0].soporteAdjunto?.fileId).toBe('f-1');
    expect(component.enviandoReclamo()).toBeTrue();
    respuesta.next({ exitoso: true } as never);
    respuesta.complete();
    expect(component.enviandoReclamo()).toBeFalse();
  });

  it('FE-05: radica sin soporte porque el soporte es opcional', () => {
    claims.crearReclamo.and.returnValue(of({ exitoso: true, mensajeUsuario: 'ok' }) as never);
    component.enviarReclamo({ categoria: 'Otro', justificacion: 'sin archivo' });

    expect(claims.subirSoporte).not.toHaveBeenCalled();
    expect(claims.crearReclamo.calls.mostRecent().args[0].soporteAdjunto).toBeUndefined();
  });

  it('un 404 al radicar con soporte descarta el adjunto y pide adjuntarlo de nuevo', () => {
    claims.subirSoporte.and.returnValue(of({ exitoso: true, datos: { fileId: 'f-1', nombre: 'a.pdf', url: '/u', tamanio: 10 } }) as never);
    component.onFileSelected(evento(archivo('a.pdf', 10, 'application/pdf')).event);
    claims.crearReclamo.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    component.enviarReclamo({ categoria: 'Otro', justificacion: 'motivo' });

    expect(component.archivoAdjunto()).toBeNull();
    expect(component.errorSoporte()).toContain('ya no está disponible');
    expect(component.enviandoReclamo()).toBeFalse();
  });
});

describe('StudentCoursesComponent', () => {
  let fixture: ComponentFixture<StudentCoursesComponent>;
  let component: StudentCoursesComponent;
  let studentServiceSpy: jasmine.SpyObj<StudentManagementService>;
  let claimServiceSpy: jasmine.SpyObj<AttendanceClaimService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let coordinatorServiceSpy: jasmine.SpyObj<CoordinatorManagementService>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockMaterias: MateriaEstudianteItem[] = [{
    id: 'mat-1', codigo: 'IS-101', nombre: 'Arquitectura de Software', creditos: 3, grupo: 'G1',
    docente: 'Ing. Pedro Pérez', aula: 'Aula 201', horario: 'Lunes 08:00 - 10:00', totalClases: 16,
    asistencias: 14, inasistencias: 2, porcentajeAsistencia: 87.5, estado: 'Al día',
  }];

  const mockSesiones: SesionMateriaDetalle[] = [{
    id: 'ses-1', materiaId: 'mat-1', numeroSesion: 1, fecha: '2026-09-01', horario: '08:00 - 10:00',
    tema: 'Clean Architecture', estadoAsistencia: 'AUSENTE', reclamoId: 'rec-1',
  }];

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj('StudentManagementService', ['getMaterias', 'getPrerrequisitosMateria', 'matricularGrupo']);
    claimServiceSpy = jasmine.createSpyObj('AttendanceClaimService', ['getSesionesPorMateria', 'crearReclamo', 'eliminarReclamo', 'subirSoporte']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    coordinatorServiceSpy = jasmine.createSpyObj('CoordinatorManagementService', ['crearSolicitudMatricula']);
    courseServiceSpy = jasmine.createSpyObj('CourseService', ['getTeacherCourses']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['registrarAutoAsistencia']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);
    studentServiceSpy.getMaterias.and.returnValue(of({ exitoso: true, datos: mockMaterias }));
    claimServiceSpy.getSesionesPorMateria.and.returnValue(of({ exitoso: true, datos: mockSesiones }));

    await TestBed.configureTestingModule({
      imports: [StudentCoursesComponent],
      providers: [
        { provide: StudentManagementService, useValue: studentServiceSpy },
        { provide: AttendanceClaimService, useValue: claimServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CoordinatorManagementService, useValue: coordinatorServiceSpy },
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inicializarse y cargar materias del estudiante', () => {
    expect(component).toBeTruthy();
    expect(component.materias().length).toBe(1);
    expect(component.totalCreditos()).toBe(3);
    expect(component.promedioAsistencia()).toBe('87.5');
    expect(component.totalFallas()).toBe(2);
  });

  it('permite ver detalle completo de sesiones y regresar a la lista', () => {
    component.verDetalleCompleto(mockMaterias[0]);
    expect(component.vistaActual()).toBe('DETALLE');
    expect(component.selectedMateria()?.id).toBe('mat-1');
    expect(component.sesiones().length).toBe(1);
    component.volverALista();
    expect(component.vistaActual()).toBe('LISTA');
    expect(component.selectedMateria()).toBeNull();
  });

  it('permite iniciar y enviar un reclamo con éxito', () => {
    component.selectedMateria.set(mockMaterias[0]);
    component.iniciarReclamo(mockSesiones[0]);
    expect(component.vistaActual()).toBe('RECLAMO');
    expect(component.sesionReclamar()?.id).toBe('ses-1');
    claimServiceSpy.crearReclamo.and.returnValue(of({ exitoso: true, mensajeUsuario: 'Reclamo radicado.' } as any));
    component.enviarReclamo({ categoria: 'Médico / Salud', justificacion: 'Estuve incapacitado por gripa fuerte.' });
    expect(claimServiceSpy.crearReclamo).toHaveBeenCalled();
    expect(toastSpy.success).toHaveBeenCalledWith('Reclamo radicado.');
    expect(component.vistaActual()).toBe('DETALLE');
  });

  it('permite retirar un reclamo existente', () => {
    component.selectedMateria.set(mockMaterias[0]);
    claimServiceSpy.eliminarReclamo.and.returnValue(of({ exitoso: true, mensajeUsuario: 'Reclamo retirado.' } as any));
    component.retirarReclamo(mockSesiones[0]);
    expect(claimServiceSpy.eliminarReclamo).toHaveBeenCalledWith('rec-1', 'mat-1', 'ses-1');
    expect(toastSpy.success).toHaveBeenCalledWith('Reclamo retirado.');
  });

  it('abre y cierra modal de prerrequisitos consultando servicio', () => {
    studentServiceSpy.getPrerrequisitosMateria.and.returnValue(of({ exitoso: true, datos: [{ id: 'p1', prerrequisitoNombre: 'Cálculo I' }] } as any));
    component.abrirPrerrequisitos(mockMaterias[0]);
    expect(component.modalPrerrequisitosVisible()).toBeTrue();
    expect(component.materiaPrerrequisitos()?.id).toBe('mat-1');
    expect(component.listaPrerrequisitos().length).toBe(1);
    component.cerrarModalPrerrequisitos();
    expect(component.modalPrerrequisitosVisible()).toBeFalse();
    expect(component.materiaPrerrequisitos()).toBeNull();
  });

  it('registra autoasistencia por PIN o Token exitosamente', () => {
    sessionServiceSpy.registrarAutoAsistencia.and.returnValue(of({ exitoso: true, mensajeUsuario: 'Asistencia registrada' } as any));
    component.abrirModalAutoAsistencia();
    expect(component.modalAutoAsistenciaVisible()).toBeTrue();
    component.enviarAutoAsistencia({ pin: '123456', token: '' });
    expect(sessionServiceSpy.registrarAutoAsistencia).toHaveBeenCalledWith({ codigoAcceso: '123456', token: undefined });
    expect(toastSpy.success).toHaveBeenCalledWith('Asistencia registrada');
    expect(component.modalAutoAsistenciaVisible()).toBeFalse();
  });

  it('registra matrícula por código o PIN exitosamente', () => {
    studentServiceSpy.matricularGrupo.and.returnValue(of({ exitoso: true, mensajeUsuario: 'Matrícula confirmada' } as any));
    component.abrirModalMatriculaGrupo();
    expect(component.modalMatriculaGrupoVisible()).toBeTrue();
    component.enviarMatriculaPorCodigo('GRP-101');
    expect(studentServiceSpy.matricularGrupo).toHaveBeenCalledWith('GRP-101');
    expect(toastSpy.success).toHaveBeenCalledWith('Matrícula confirmada');
    expect(component.modalMatriculaGrupoVisible()).toBeFalse();
  });
});
