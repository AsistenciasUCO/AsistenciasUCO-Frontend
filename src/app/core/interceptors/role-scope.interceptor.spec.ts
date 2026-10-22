import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ROLE_SCOPE_RULES, rolPuedeLeer, roleScopeInterceptor } from './role-scope.interceptor';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('roleScopeInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  const usuario = signal<User | null>(null);

  function como(role: UserRole | null): void {
    usuario.set(role ? ({ id: 'u', role } as User) : null);
  }

  beforeEach(() => {
    usuario.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([roleScopeInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: usuario } },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  function estado(url: string): Promise<number> {
    return new Promise((resolve) => http.get(url).subscribe({ next: () => resolve(200), error: (e) => resolve(e.status) }));
  }

  it('un Decano no hace GET a /admin, /coordinador, /docente ni /docentes: recibe 403 local sin tocar la red', async () => {
    como('DECANO');
    for (const ruta of ['admin/areas', 'coordinador/planes-estudio', 'coordinador/periodos-academicos', 'docente/horarios', 'docentes']) {
      expect(await estado(`${environment.apiUrl}/${ruta}`)).toBe(403);
    }
    ctrl.expectNone(() => true);
  });

  it('un Decano si consulta sus propios endpoints y los catalogos generales', () => {
    como('DECANO');
    http.get(`${environment.apiUrl}/decano/programas`).subscribe();
    http.get(`${environment.apiUrl}/tipos-programa`).subscribe();
    ctrl.expectOne(`${environment.apiUrl}/decano/programas`).flush({});
    ctrl.expectOne(`${environment.apiUrl}/tipos-programa`).flush([]);
  });

  it('las escrituras nunca se interceptan: las rechaza el backend', () => {
    como('DECANO');
    http.post(`${environment.apiUrl}/admin/facultades`, {}).subscribe({ error: () => undefined });
    ctrl.expectOne(`${environment.apiUrl}/admin/facultades`).flush({}, { status: 403, statusText: 'Forbidden' });
  });

  it('sin sesion o fuera del API v1 la peticion pasa sin cambios', () => {
    como(null);
    http.get(`${environment.apiUrl}/admin/areas`).subscribe({ error: () => undefined });
    http.get('http://otro-host.test/api/v1/admin/areas').subscribe({ error: () => undefined });
    http.get('/assets/config.json').subscribe();
    ctrl.expectOne(`${environment.apiUrl}/admin/areas`).flush({});
    ctrl.expectOne('http://otro-host.test/api/v1/admin/areas').flush({});
    ctrl.expectOne('/assets/config.json').flush({});
  });

  it('un segmento sin regla (p. ej. grupos, sesiones) pasa para cualquier rol', () => {
    como('ESTUDIANTE');
    http.get(`${environment.apiUrl}/grupos/x/estudiantes`).subscribe();
    ctrl.expectOne(`${environment.apiUrl}/grupos/x/estudiantes`).flush([]);
  });

  describe('matriz rol x prefijo (espejo de SecurityConfig)', () => {
    const esperado: Record<string, UserRole[]> = {
      admin: ['ADMINISTRADOR'],
      decano: ['DECANO', 'ADMINISTRADOR'],
      coordinador: ['COORDINADOR', 'ADMINISTRADOR'],
      docente: ['DOCENTE'],
      docentes: ['COORDINADOR', 'ADMINISTRADOR'],
      estudiante: ['ESTUDIANTE'],
      estudiantes: ['DOCENTE', 'COORDINADOR', 'ADMINISTRADOR'],
    };
    const roles: UserRole[] = ['ADMINISTRADOR', 'DECANO', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'];

    it('cubre exactamente los prefijos esperados', () => {
      expect(ROLE_SCOPE_RULES.map((r) => r.prefix).sort()).toEqual(Object.keys(esperado).sort());
    });

    for (const prefijo of Object.keys(esperado)) {
      for (const rol of roles) {
        it(`${rol} ${esperado[prefijo].includes(rol) ? 'puede' : 'no puede'} leer /${prefijo}`, () => {
          expect(rolPuedeLeer(rol, prefijo)).toBe(esperado[prefijo].includes(rol));
        });
      }
    }

    it('ADMIN (alias legado) se trata como ADMINISTRADOR', () => {
      expect(rolPuedeLeer('ADMIN', 'admin')).toBeTrue();
    });
  });
});
