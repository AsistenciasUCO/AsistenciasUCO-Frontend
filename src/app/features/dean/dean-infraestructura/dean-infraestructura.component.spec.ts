import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { DeanInfraestructuraComponent } from './dean-infraestructura.component';
import { environment } from '../../../../environments/environment';

describe('DeanInfraestructuraComponent', () => {
  let fixture: ComponentFixture<DeanInfraestructuraComponent>;
  let component: DeanInfraestructuraComponent;
  let http: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [DeanInfraestructuraComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DeanInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    http.expectOne(`${environment.apiUrl}/admin/areas`).flush({
      exitoso: true,
      datos: [
        {
          id: 'area-1',
          codigo: 'AREA-SOFT',
          nombre: 'Ingeniería de Software',
          activa: true,
        },
      ],
    });
    http.expectOne(`${environment.apiUrl}/admin/sedes`).flush({
      exitoso: true,
      datos: [
        {
          id: 'sede-1',
          codigo: 'RION',
          nombre: 'Campus Rionegro',
          municipio: 'Rionegro',
          direccion: 'Sector 3',
          telefono: '5698000',
          estado: 'ACTIVO',
        },
      ],
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('carga áreas, sedes y espacios de la facultad y permite filtrar', () => {
    expect(component.areas().length).toBe(1);
    expect(component.sedes().length).toBe(1);

    component.filtroTexto.set('Software');
    expect(component.areasFiltradas().length).toBe(1);
    expect(component.sedesFiltradas().length).toBe(0);
  });
});


// UX-09 / AUTH-04: un 403/501 de áreas o sedes no es «0».
describe('DeanInfraestructuraComponent con errores HTTP', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeanInfraestructuraComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: { navigate: () => Promise.resolve(true) } }],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sedes no disponibles (501) se informan y las áreas cargadas se conservan', () => {
    const fixture = TestBed.createComponent(DeanInfraestructuraComponent);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/admin/areas`).flush({
      exitoso: true,
      datos: [{ id: 'area-1', codigo: 'AREA-SOFT', nombre: 'Ingeniería de Software', activa: true }],
    });
    http.expectOne(`${environment.apiUrl}/admin/sedes`).flush(
      { exitoso: false, codigo: 'FEATURE_UNAVAILABLE', mensajeUsuario: 'No disponible.' },
      { status: 501, statusText: 'Not Implemented' }
    );
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(fixture.componentInstance.sedesTotal()).toBe('—');
    expect(fixture.componentInstance.areasTotal()).toBe('1');
    expect(text).toContain('No fue posible cargar las sedes.');
    expect(text).not.toContain('No se encontraron sedes registradas.');
    expect(text).not.toContain('Espacios Físicos0');
  });
});
