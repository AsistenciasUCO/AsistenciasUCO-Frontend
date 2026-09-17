import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

function base64UrlEncode(json: object): string {
  // UTF-8 safe base64 (parseJwt reverses this exact encoding via atob + decodeURIComponent).
  const utf8Latin1 = unescape(encodeURIComponent(JSON.stringify(json)));
  const base64 = btoa(utf8Latin1);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = base64UrlEncode({ alg: 'RS256', typ: 'JWT' });
  const body = base64UrlEncode(payload);
  return `${header}.${body}.signature`;
}

const VALID_UUID = 'a1b2c3d4-e5f6-4789-9abc-1234567890ab';

function basePayload(overrides: Record<string, unknown> = {}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    sub: 'keycloak-sub-1',
    idUsuario: VALID_UUID,
    email: 'docente@uco.edu.co',
    given_name: 'Ana',
    family_name: 'Gómez',
    exp: nowSeconds + 3600,
    iat: nowSeconds,
    resource_access: {
      'asistencias-api': { roles: ['DOCENTE'] },
    },
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthService);
    service.setMockMode(false);
    fetchSpy = spyOn(window, 'fetch');
  });

  afterEach(() => {
    localStorage.clear();
  });

  function mockTokenResponse(payload: Record<string, unknown>, refreshToken = 'refresh-1') {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: makeJwt(payload),
          refresh_token: refreshToken,
        }),
    } as Response);
  }

  describe('mapeo de roles institucionales', () => {
    it('acepta un rol presente en resource_access["asistencias-api"].roles', async () => {
      mockTokenResponse(basePayload({ resource_access: { 'asistencias-api': { roles: ['DOCENTE'] } } }));

      const user = await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      expect(user.role).toBe('DOCENTE');
    });

    it('rechaza un rol presente solo en realm_access', async () => {
      mockTokenResponse(
        basePayload({
          resource_access: { 'asistencias-api': { roles: [] } },
          realm_access: { roles: ['DOCENTE'] },
        })
      );

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
    });

    it('rechaza un rol presente solo en el client del frontend (asistencias-uco-frontend)', async () => {
      mockTokenResponse(
        basePayload({
          resource_access: {
            'asistencias-api': { roles: [] },
            'asistencias-uco-frontend': { roles: ['DOCENTE'] },
          },
        })
      );

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
    });

    it('ignora un rol técnico desconocido y rechaza la sesión si no hay otro válido', async () => {
      mockTokenResponse(
        basePayload({ resource_access: { 'asistencias-api': { roles: ['ROL_DESCONOCIDO'] } } })
      );

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
    });

    it('nunca cae por defecto en DOCENTE cuando no hay rol institucional válido', async () => {
      mockTokenResponse(basePayload({ resource_access: { 'asistencias-api': { roles: [] } } }));

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('validación de idUsuario', () => {
    it('acepta un idUsuario UUID válido', async () => {
      mockTokenResponse(basePayload({ idUsuario: VALID_UUID }));

      const user = await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      expect(user.id).toBe(VALID_UUID);
    });

    it('rechaza la sesión si idUsuario está ausente', async () => {
      const payload = basePayload();
      delete (payload as Record<string, unknown>)['idUsuario'];
      mockTokenResponse(payload);

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
    });

    it('rechaza la sesión si idUsuario no es un UUID válido', async () => {
      mockTokenResponse(basePayload({ idUsuario: 'user-default' }));

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
    });

    it('no usa sub como sustituto de idUsuario', async () => {
      mockTokenResponse(basePayload({ idUsuario: undefined, sub: 'keycloak-sub-only' }));

      await expectAsync(
        service.loginWithCredentials('docente@uco.edu.co', 'pass')
      ).toBeRejected();
    });
  });

  describe('refresh de token', () => {
    it('refreshAccessToken exitoso guarda el nuevo access token en memoria y no en localStorage', async () => {
      mockTokenResponse(basePayload(), 'refresh-new');

      const result = await service.refreshAccessToken('refresh-old');

      expect(result).toBeTrue();
      expect(service.token()).toBeTruthy();
      expect(localStorage.getItem('gestio_refresh_token')).toBeNull();
      expect(localStorage.getItem('gestio_access_token')).toBeNull();
    });

    it('refreshAccessToken fallido (HTTP no ok) devuelve false', async () => {
      fetchSpy.and.resolveTo({ ok: false, json: () => Promise.resolve({}) } as Response);

      const result = await service.refreshAccessToken('refresh-old');

      expect(result).toBeFalse();
    });

    it('refreshAccessToken sin refresh token disponible devuelve false sin llamar a fetch', async () => {
      const result = await service.refreshAccessToken();

      expect(result).toBeFalse();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('getValidAccessToken', () => {
    it('en modo mock siempre devuelve null', async () => {
      service.setMockMode(true);

      const token = await service.getValidAccessToken();

      expect(token).toBeNull();
    });

    it('sin sesión iniciada devuelve null', async () => {
      const token = await service.getValidAccessToken();

      expect(token).toBeNull();
    });

    it('con token vigente lo devuelve sin refrescar', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');
      fetchSpy.calls.reset();

      const token = await service.getValidAccessToken(30);

      expect(token).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('con token próximo a expirar intenta refrescarlo', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      mockTokenResponse(basePayload({ exp: nowSeconds + 10 }));
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      mockTokenResponse(basePayload({ exp: nowSeconds + 3600 }));
      const token = await service.getValidAccessToken(30);

      expect(token).toBeTruthy();
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('modo mock', () => {
    it('no rompe: initKeycloak inicia sesión con un usuario mock', async () => {
      service.setMockMode(true);

      const result = await service.initKeycloak();

      expect(result).toBeTrue();
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()?.role).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('loginWithCredentials en modo mock no llama a fetch', async () => {
      service.setMockMode(true);

      const user = await service.loginWithCredentials('DOCENTE', 'cualquiera');

      expect(user).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('setMockMode persiste la preferencia en localStorage', () => {
      service.setMockMode(true);
      expect(localStorage.getItem('USE_MOCKS')).toBe('true');

      service.setMockMode(false);
      expect(localStorage.getItem('USE_MOCKS')).toBeNull();
    });
  });

  describe('initKeycloak (gestión de sesión segura en memoria)', () => {
    it('sin token en memoria devuelve false', async () => {
      const result = await service.initKeycloak();
      expect(result).toBeFalse();
    });

    it('con token vigente en memoria mantiene la sesión', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      const result = await service.initKeycloak();

      expect(result).toBeTrue();
      expect(service.currentUser()?.name).toBe('Ana Gómez');
    });

    it('no lee ni restaura tokens desde localStorage (seguridad OWASP/AGENTS.md)', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const payload = basePayload({ exp: nowSeconds + 3600 });
      localStorage.setItem('gestio_access_token', makeJwt(payload));

      const result = await service.initKeycloak();

      expect(result).toBeFalse();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('purga credenciales legacy residuales de versiones anteriores', () => {
      localStorage.setItem('gestio_access_token', 'legacy-token');
      localStorage.setItem('gestio_refresh_token', 'legacy-refresh');
      localStorage.setItem('gestio_current_user', '{"id":"123"}');

      service.clearSession();

      expect(localStorage.getItem('gestio_access_token')).toBeNull();
      expect(localStorage.getItem('gestio_refresh_token')).toBeNull();
      expect(localStorage.getItem('gestio_current_user')).toBeNull();
    });
  });

  describe('navegación por rol', () => {
    it('navega a la ruta correcta para cada rol institucional', () => {
      service.navigateForRole('ADMINISTRADOR');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/admin/decanos']);

      service.navigateForRole('DECANO');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/decano/coordinadores']);

      service.navigateForRole('COORDINADOR');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/coordinador/docentes']);

      service.navigateForRole('DOCENTE');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/docente/grupos']);

      service.navigateForRole('ESTUDIANTE');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/estudiante/horarios']);
    });
  });

  describe('logout / clearSession', () => {
    it('logout limpia la sesión y navega a /login', async () => {
      service.setMockMode(true);
      await service.loginWithCredentials('DOCENTE', 'x');

      await service.logout();

      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('clearSession elimina todas las claves de localStorage', () => {
      localStorage.setItem('gestio_access_token', 'x');
      localStorage.setItem('gestio_refresh_token', 'y');
      localStorage.setItem('gestio_current_user', '{}');
      localStorage.setItem('gestio_asistencia_mock_role', 'DOCENTE');

      service.clearSession();

      expect(localStorage.getItem('gestio_access_token')).toBeNull();
      expect(localStorage.getItem('gestio_refresh_token')).toBeNull();
      expect(localStorage.getItem('gestio_current_user')).toBeNull();
      expect(localStorage.getItem('gestio_asistencia_mock_role')).toBeNull();
    });
  });

  describe('login()', () => {
    it('devuelve un ApiResponse informativo con el usuario actual', (done) => {
      service.login().subscribe((res) => {
        expect(res.exitoso).toBeTrue();
        expect(res.datos).toBeNull();
        done();
      });
    });
  });

  describe('updateUserProfile', () => {
    it('sin usuario autenticado devuelve un ApiResponse fallido', (done) => {
      service.updateUserProfile({ primerNombre: 'X' }).subscribe((res) => {
        expect(res.exitoso).toBeFalse();
        done();
      });
    });

    it('en modo mock actualiza el usuario localmente', (done) => {
      service.setMockMode(true);
      service.loginAsMockUser('DOCENTE', false);

      service.updateUserProfile({ primerNombre: 'Nuevo' }).subscribe((res) => {
        expect(res.exitoso).toBeTrue();
        expect(res.datos.primerNombre).toBe('Nuevo');
        expect(service.currentUser()?.primerNombre).toBe('Nuevo');
        done();
      });
    });

    it('en modo real hace PUT al backend y sincroniza la respuesta', (done) => {
      mockTokenResponse(basePayload());
      service.loginWithCredentials('docente@uco.edu.co', 'pass').then(() => {
        fetchSpy.and.resolveTo({
          ok: true,
          json: () =>
            Promise.resolve({
              idTransaccion: 'tx-1',
              datos: { primerNombre: 'Actualizado' },
            }),
        } as Response);

        service.updateUserProfile({ primerNombre: 'Nuevo' }).subscribe((res) => {
          expect(res.exitoso).toBeTrue();
          expect(res.datos.primerNombre).toBe('Actualizado');
          done();
        });
      });
    });

    it('en modo real propaga el error si el backend responde con fallo', (done) => {
      mockTokenResponse(basePayload());
      service.loginWithCredentials('docente@uco.edu.co', 'pass').then(() => {
        fetchSpy.and.resolveTo({ ok: false } as Response);

        service.updateUserProfile({ primerNombre: 'Nuevo' }).subscribe({
          error: (err) => {
            expect(err).toBeTruthy();
            done();
          },
        });
      });
    });
  });

  describe('fetchProfileFromBackend', () => {
    it('en modo mock devuelve el usuario actual sin llamar a fetch', async () => {
      service.setMockMode(true);
      service.loginAsMockUser('DOCENTE', false);
      fetchSpy.calls.reset();

      const result = await service.fetchProfileFromBackend();

      expect(result).toBe(service.currentUser());
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('sin token devuelve null', async () => {
      const result = await service.fetchProfileFromBackend();
      expect(result).toBeNull();
    });

    it('con HTTP no ok devuelve null', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');
      fetchSpy.and.resolveTo({ ok: false } as Response);

      const result = await service.fetchProfileFromBackend();

      expect(result).toBeNull();
    });

    it('ante un error de red devuelve null sin lanzar', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');
      fetchSpy.and.rejectWith(new Error('network down'));

      const result = await service.fetchProfileFromBackend();

      expect(result).toBeNull();
    });

    it('sincroniza campos del perfil recibido del backend', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');
      fetchSpy.and.resolveTo({
        ok: true,
        json: () =>
          Promise.resolve({ datos: { primerNombre: 'Sincronizado', numeroIdentificacion: '123' } }),
      } as Response);

      const result = await service.fetchProfileFromBackend();

      expect(result?.primerNombre).toBe('Sincronizado');
    });

    it('conserva los valores actuales cuando el backend no envía todos los campos', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');
      const before = service.currentUser()!;
      fetchSpy.and.resolveTo({
        ok: true,
        json: () => Promise.resolve({ datos: {} }),
      } as Response);

      const result = await service.fetchProfileFromBackend();

      expect(result?.primerNombre).toBe(before.primerNombre);
      expect(result?.email).toBe(before.email);
    });

    it('devuelve null si el backend responde sin datos', async () => {
      mockTokenResponse(basePayload());
      await service.loginWithCredentials('docente@uco.edu.co', 'pass');
      fetchSpy.and.resolveTo({ ok: true, json: () => Promise.resolve({}) } as Response);

      const result = await service.fetchProfileFromBackend();

      expect(result).toBeNull();
    });
  });

  describe('mapPayloadToUser: fallbacks de nombre/email', () => {
    it('usa payload.name si no hay given_name/family_name', async () => {
      mockTokenResponse(
        basePayload({ given_name: undefined, family_name: undefined, name: 'Nombre Completo' })
      );

      const user = await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      expect(user.name).toBe('Nombre Completo');
    });

    it('usa preferred_username si no hay name ni given_name/family_name', async () => {
      mockTokenResponse(
        basePayload({
          given_name: undefined,
          family_name: undefined,
          name: undefined,
          preferred_username: 'jdocente',
        })
      );

      const user = await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      expect(user.name).toBe('jdocente');
    });

    it('usa preferred_username para construir el email cuando el token no trae email', async () => {
      mockTokenResponse(basePayload({ email: undefined, preferred_username: 'jdocente' }));

      const user = await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      expect(user.email).toBe('jdocente@uco.edu.co');
    });

    it('usa un nombre por defecto si el token no trae ningún dato de nombre', async () => {
      mockTokenResponse(
        basePayload({
          given_name: undefined,
          family_name: undefined,
          name: undefined,
          preferred_username: undefined,
        })
      );

      const user = await service.loginWithCredentials('docente@uco.edu.co', 'pass');

      expect(user.name).toBe('Usuario Institucional');
    });
  });

  describe('updateUserProfile: fallbacks de campos', () => {
    it('sin overrides conserva los campos individuales actuales', (done) => {
      service.setMockMode(true);
      service.loginAsMockUser('DOCENTE', false);
      const before = service.currentUser()!;

      service.updateUserProfile({}).subscribe((res) => {
        expect(res.datos.primerNombre).toBe(before.primerNombre || '');
        expect(res.datos.primerApellido).toBe(before.primerApellido || '');
        done();
      });
    });

    it('con segundoNombre y segundoApellido provistos, los usa en el nombre completo', (done) => {
      service.setMockMode(true);
      service.loginAsMockUser('DOCENTE', false);

      service
        .updateUserProfile({ segundoNombre: 'Del Carmen', segundoApellido: 'Restrepo' })
        .subscribe((res) => {
          expect(res.datos.segundoNombre).toBe('Del Carmen');
          expect(res.datos.segundoApellido).toBe('Restrepo');
          expect(res.datos.name).toContain('Del Carmen');
          done();
        });
    });
  });

  describe('refreshAccessToken: fallback de refresh_token', () => {
    it('si la respuesta no incluye refresh_token nuevo, conserva el anterior en memoria y no en localStorage', async () => {
      fetchSpy.and.resolveTo({
        ok: true,
        json: () => Promise.resolve({ access_token: makeJwt(basePayload()) }),
      } as Response);

      const result = await service.refreshAccessToken('refresh-original');

      expect(result).toBeTrue();
      expect(service.token()).toBeTruthy();
      expect(localStorage.getItem('gestio_refresh_token')).toBeNull();
    });
  });
});
