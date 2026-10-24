import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CoordinatorIndicatorsComponent } from './coordinator-indicators.component';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { AlertaTemprana, KpisCoordinador } from '../../../core/models/coordinator-indicators.model';

describe('CoordinatorIndicatorsComponent', () => {
  let fixture: ComponentFixture<CoordinatorIndicatorsComponent>;
  let component: CoordinatorIndicatorsComponent;
  let http: HttpTestingController;
  let toast: ToastService;
  const base = `${environment.apiUrl}/coordinador`;

  const kpis: KpisCoordinador = {
    idPrograma: 'p-1', nombrePrograma: 'Sistemas', idPeriodoAcademico: 'per-1', nombrePeriodoAcademico: '2026-2',
    totalEstudiantes: 5, estudiantesRegulares: 2, estudiantesRiesgo: 1, estudiantesPerdida: 2, tasaPermanencia: 60,
    sesionesProgramadas: 15, sesionesVencidas: 10, sesionesEjecutadas: 9, sesionesVencidasSinRegistro: 1, sesionesSinProcedenciaTemporal: 1,
    porcentajeCumplimiento: 90, porcentajeProgresoCalendario: 66.67, umbralAdvertencia: 15, umbralPerdida: 20,
  };
  const alerta: AlertaTemprana = {
    idEstudiante: 'e-1', nombreCompleto: 'Ana Pérez', numeroIdentificacion: 1017000001, correo: 'ana@uco.edu.co',
    totalMatriculasActivas: 2, porcentajeInasistencia: 66.67, faltasSinJustaCausa: 2, codigoPermanencia: 'PERDIDA', semaforo: 'ROJO',
  };

  const alertasReq = () => http.match((r) => r.url === `${base}/alertas-tempranas`);
  const texto = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CoordinatorIndicatorsComponent], providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(CoordinatorIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne((r) => r.url === `${base}/indicadores`).flush({ exitoso: true, datos: kpis });
    alertasReq().forEach((r) => r.flush({ exitoso: true, datos: [alerta], total: 12 }));
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('T-FE-02 muestra exactamente las cifras recibidas (sin calcular nada en el cliente)', () => {
    const t = texto();
    expect(t).toContain('90%');       // cumplimiento
    expect(t).toContain('60%');       // permanencia
    expect(t).toContain('66.67%');    // progreso del calendario
    expect(t).toContain('9');         // ejecutadas
    expect(component.service.kpis()).toEqual(kpis);
  });

  it('T-FE-02 un porcentaje nulo se muestra como "Sin datos", nunca como 0', () => {
    component.service.kpis.set({ ...kpis, porcentajeCumplimiento: null, tasaPermanencia: null, porcentajeProgresoCalendario: null });
    fixture.detectChanges();
    expect(texto()).toContain('Sin datos');
    expect(component.formatoPorcentaje(null)).toBe('Sin datos');
    expect(component.formatoPorcentaje(33.33)).toBe('33.33%');
  });

  it('T-FE-03 la tabla muestra la alerta con su semáforo y el total llega al paginador', () => {
    expect(texto()).toContain('Ana Pérez');
    expect(texto()).toContain('66.67%');
    expect(component.service.totalAlertas()).toBe(12);
  });

  it('T-FE-03 cambiar de página vuelve a consultar el backend con esa página', () => {
    component.onPageChange(2);
    const req = http.expectOne((r) => r.url === `${base}/alertas-tempranas`);
    expect(req.request.params.get('pagina')).toBe('2');
    req.flush({ exitoso: true, datos: [], total: 12 });
  });

  it('T-FE-03 los filtros reinician la página y se envían al backend', () => {
    component.filtroSemaforo.set('ROJO');
    component.filtroNombre.set('Ana');
    component.aplicarFiltros();
    const req = http.expectOne((r) => r.url === `${base}/alertas-tempranas`);
    expect(req.request.params.get('pagina')).toBe('1');
    expect(req.request.params.get('semaforo')).toBe('ROJO');
    expect(req.request.params.get('nombre')).toBe('Ana');
    req.flush({ exitoso: true, datos: [alerta], total: 1 });
  });

  it('T-FE-03 las opciones del filtro de semáforo usan los códigos del contrato (VERDE/AMBAR/ROJO)', () => {
    const valores = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('select[aria-label="Semáforo"] option')).map((o) => (o as HTMLOptionElement).value);
    expect(valores).toEqual(['', 'ROJO', 'AMBAR']);
  });

  it('T-FE-03 un error al cargar muestra el mensaje del backend', () => {
    spyOn(toast, 'error');
    component.cargar();
    http.expectOne((r) => r.url === `${base}/indicadores`).flush({ message: 'No tiene un programa a su cargo.' }, { status: 403, statusText: 'Forbidden' });
    alertasReq().forEach((r) => r.flush({ message: 'No tiene un programa a su cargo.' }, { status: 403, statusText: 'Forbidden' }));
    expect(toast.error).toHaveBeenCalled();
  });

  it('T-FE-04 abrir la ficha desde una alerta selecciona al estudiante y cerrarla lo limpia', () => {
    component.abrirFicha(alerta);
    expect(component.estudianteFicha()).toEqual(alerta);
    fixture.detectChanges();
    http.match((r) => r.url.includes('/estudiantes/e-1/')).forEach((r) => r.flush({ exitoso: true, datos: [], total: 0 }));
    component.cerrarFicha();
    expect(component.estudianteFicha()).toBeNull();
  });

  it('el estado vacío se muestra cuando no hay alertas', () => {
    component.service.alertas.set([]);
    fixture.detectChanges();
    expect(texto()).toContain('No hay estudiantes');
  });
});
