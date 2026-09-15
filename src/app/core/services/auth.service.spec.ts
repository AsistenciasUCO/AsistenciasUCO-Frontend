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
    it('refreshAccessToken exitoso guarda el nuevo access token', async () => {
      localStorage.setItem('gestio_refresh_token', 'refresh-old');
      mockTokenResponse(basePayload(), 'refresh-new');

      const result = await service.refreshAccessToken();

      expect(result).toBeTrue();
      expect(localStorage.getItem('gestio_refresh_token')).toBe('refresh-new');
    });

    it('refreshAccessToken fallido (HTTP no ok) devuelve false', async () => {
      localStorage.setItem('gestio_refresh_token', 'refresh-old');
      fetchSpy.and.resolveTo({ ok: false, json: () => Promise.resolve({}) } as Response);

      const result = await service.refreshAccessToken();

      expect(result).toBeFalse();
    });

    it('refreshAccessToken sin refresh token guardado devuelve false sin llamar a fetch', async () => {
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
});
