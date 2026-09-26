import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

describe('roleGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: AuthService;
  let currentRole: User['role'];

  const user = (role: User['role']): User => ({
    id: 'user-1',
    name: 'Usuario de prueba',
    email: 'user@example.test',
    role,
    institutionName: 'UCO',
    status: 'active',
  });

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.callFake((commands) => ({ commands } as any));
    currentRole = 'DOCENTE';
    authService = {
      currentUser: () => user(currentRole),
    } as unknown as AuthService;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  function runFor(role: User['role']): unknown {
    currentRole = role;
    const route = {
      data: { roles: ['DOCENTE'] },
    } as unknown as ActivatedRouteSnapshot;

    return TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
  }

  it('permite DOCENTE en la ruta de asistencia', () => {
    expect(runFor('DOCENTE')).toBeTrue();
  });

  it('rechaza roles administrativos en la ruta exclusiva de DOCENTE', () => {
    expect(runFor('ADMINISTRADOR')).not.toBeTrue();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/app/admin/decanos']);
  });
});
