import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User, UserRole } from '../models/user.model';
import { MOCK_USERS_BY_ROLE, MOCK_USERS_LIST } from '../mocks/user.mock';
import { environment } from '../../../environments/environment';

const MOCK_STORAGE_KEY = 'gestio_asistencia_mock_role';
const ACCESS_TOKEN_KEY = 'gestio_access_token';
const REFRESH_TOKEN_KEY = 'gestio_refresh_token';
const USER_STORAGE_KEY = 'gestio_current_user';

interface JwtTokenPayload {
  sub?: string;
  idUsuario?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  exp?: number;
  iat?: number;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: {
    [key: string]: {
      roles?: string[];
    };
  };
}

function parseJwt(token: string): JwtTokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtTokenPayload;
  } catch (e) {
    console.error('Error al decodificar JWT:', e);
    return null;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.token());
  private mockModeSignal = signal<boolean>(environment.useMocks);
  isMockMode = computed(() => this.mockModeSignal());

  setMockMode(enabled: boolean): void {
    if (enabled) {
      localStorage.setItem('USE_MOCKS', 'true');
    } else {
      localStorage.removeItem('USE_MOCKS');
    }
    this.mockModeSignal.set(enabled);
  }

  constructor(private router: Router) {}

  async initKeycloak(): Promise<boolean> {
    if (this.mockModeSignal()) {
      const savedRole = localStorage.getItem(MOCK_STORAGE_KEY) as UserRole | null;
      const initialRole: UserRole = savedRole && MOCK_USERS_BY_ROLE[savedRole] ? savedRole : 'DOCENTE';
      this.loginAsMockUser(initialRole, false);
      return true;
    }

    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (savedToken) {
      const payload = parseJwt(savedToken);
      const nowSeconds = Math.floor(Date.now() / 1000);

      // Si el token aún es válido (con margen de 10s)
      if (payload && payload.exp && payload.exp > nowSeconds + 10) {
        this.token.set(savedToken);
        const savedUserJson = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUserJson) {
          try {
            this.currentUser.set(JSON.parse(savedUserJson));
            return true;
          } catch {
            // Ignorar error de parsing
          }
        }
        const user = this.mapPayloadToUser(payload);
        this.currentUser.set(user);
        this.fetchProfileFromBackend(savedToken);
        return true;
      }

      // Si expiró, intentar renovar con refresh_token
      const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (savedRefreshToken) {
        const refreshed = await this.refreshAccessToken(savedRefreshToken);
        if (refreshed) {
          return true;
        }
      }

      this.clearSession();
    }

    return false;
  }

  async loginWithCredentials(usernameInput: string, passwordInput: string): Promise<User> {
    const username = (usernameInput || '').trim();
    const password = passwordInput || '';

    if (!username || !password) {
      throw new Error('Por favor ingresa tu usuario y contraseña.');
    }

    if (this.mockModeSignal()) {
      const foundMock = MOCK_USERS_LIST.find(
        (u) =>
          u.email.toLowerCase() === username.toLowerCase() ||
          u.role.toLowerCase() === username.toLowerCase()
      );
      const roleToUse: UserRole = foundMock ? foundMock.role : 'DOCENTE';
      this.loginAsMockUser(roleToUse, true);
      return this.currentUser()!;
    }

    const keycloakUrl = environment.keycloak.url.replace(/\/+$/, '');
    const tokenEndpoint = `${keycloakUrl}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      client_id: environment.keycloak.clientId,
      grant_type: 'password',
      username: username,
      password: password,
    });

    let response: Response;
    try {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
    } catch (networkError) {
      console.error('Error de red al conectar con el servidor de autenticación institucional:', networkError);
      throw new Error('No se pudo establecer conexión con el servidor de autenticación institucional.');
    }

    if (!response.ok) {
      let errorDesc = 'Usuario o contraseña incorrectos.';
      try {
        const errorJson = await response.json();
        if (errorJson?.error_description) {
          errorDesc = errorJson.error_description;
          if (errorDesc === 'Invalid user credentials') {
            errorDesc = 'Credenciales inválidas. Verifica tu usuario y contraseña institucional.';
          }
        }
      } catch {
        // Ignorar error al parsear cuerpo
      }
      throw new Error(errorDesc);
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const payload = parseJwt(accessToken);
    if (!payload) {
      throw new Error('Respuesta de autenticación inválida.');
    }

    const user = this.mapPayloadToUser(payload);

    this.token.set(accessToken);
    this.currentUser.set(user);

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    await this.fetchProfileFromBackend(accessToken);

    this.navigateForRole(user.role);
    return this.currentUser() || user;
  }

  async refreshAccessToken(refreshTokenStr?: string): Promise<boolean> {
    const refreshToken = refreshTokenStr || localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    const keycloakUrl = environment.keycloak.url.replace(/\/+$/, '');
    const tokenEndpoint = `${keycloakUrl}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      client_id: environment.keycloak.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        return false;
      }

      const tokenData = await response.json();
      const accessToken = tokenData.access_token;
      const newRefreshToken = tokenData.refresh_token || refreshToken;

      const payload = parseJwt(accessToken);
      if (!payload) return false;

      const user = this.mapPayloadToUser(payload);
      this.token.set(accessToken);
      this.currentUser.set(user);

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      this.fetchProfileFromBackend(accessToken);
      return true;
    } catch {
      return false;
    }
  }

  loginAsMockUser(role: UserRole, navigateToApp: boolean = true): void {
    const selectedUser = MOCK_USERS_BY_ROLE[role] || MOCK_USERS_BY_ROLE.DOCENTE;
    this.currentUser.set(selectedUser);
    const mockToken = `mock-jwt-token-${role.toLowerCase()}-${selectedUser.id}`;
    this.token.set(mockToken);
    localStorage.setItem(MOCK_STORAGE_KEY, role);
    localStorage.setItem(ACCESS_TOKEN_KEY, mockToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(selectedUser));

    if (navigateToApp) {
      this.navigateForRole(role);
    }
  }

  navigateForRole(role: UserRole): void {
    switch (role) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        this.router.navigate(['/app/admin/decanos']);
        break;
      case 'DECANO':
        this.router.navigate(['/app/decano/coordinadores']);
        break;
      case 'COORDINADOR':
        this.router.navigate(['/app/coordinador/docentes']);
        break;
      case 'DOCENTE':
        this.router.navigate(['/app/docente/grupos']);
        break;
      case 'ESTUDIANTE':
        this.router.navigate(['/app/estudiante/horarios']);
        break;
      default:
        this.router.navigate(['/app/dashboard']);
        break;
    }
  }

  login(): Observable<ApiResponse<User | null>> {
    return of({
      idTransaccion: 'tx-login-info',
      exitoso: true,
      mensajeUsuario: 'Utiliza el formulario de inicio de sesión de Angular.',
      datos: this.currentUser(),
    });
  }

  async logout(): Promise<void> {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }

  updateUserProfile(updatedData: Partial<User>): Observable<ApiResponse<User>> {
    const current = this.currentUser();
    if (!current) {
      return of({
        idTransaccion: 'tx-profile-error',
        exitoso: false,
        mensajeUsuario: 'No hay usuario autenticado para actualizar.',
        datos: {} as User,
      });
    }

    const primerNombre = updatedData.primerNombre !== undefined ? updatedData.primerNombre : (current.primerNombre || '');
    const segundoNombre = updatedData.segundoNombre !== undefined ? updatedData.segundoNombre : (current.segundoNombre || '');
    const primerApellido = updatedData.primerApellido !== undefined ? updatedData.primerApellido : (current.primerApellido || '');
    const segundoApellido = updatedData.segundoApellido !== undefined ? updatedData.segundoApellido : (current.segundoApellido || '');

    const computedFullName = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean).join(' ') || updatedData.name || current.name;

    const updatedUser: User = {
      ...current,
      ...updatedData,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      name: computedFullName,
    };

    if (this.mockModeSignal()) {
      this.currentUser.set(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return of({
        idTransaccion: 'mock-tx-update-profile',
        exitoso: true,
        mensajeUsuario: 'Información de perfil actualizada exitosamente.',
        datos: updatedUser,
      });
    }

    return new Observable<ApiResponse<User>>((subscriber) => {
      const token = this.token();
      fetch(`${environment.apiUrl}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          primerNombre,
          segundoNombre,
          primerApellido,
          segundoApellido,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Error al actualizar perfil en el servidor.');
          return res.json();
        })
        .then((data) => {
          const raw = data.datos || {};
          const syncedUser: User = {
            ...updatedUser,
            primerNombre: raw.primerNombre || updatedUser.primerNombre,
            segundoNombre: raw.segundoNombre || updatedUser.segundoNombre,
            primerApellido: raw.primerApellido || updatedUser.primerApellido,
            segundoApellido: raw.segundoApellido || updatedUser.segundoApellido,
            name: raw.name || updatedUser.name,
            numeroIdentificacion: raw.numeroIdentificacion || updatedUser.numeroIdentificacion,
          };
          this.currentUser.set(syncedUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(syncedUser));
          subscriber.next({
            idTransaccion: data.idTransaccion || 'tx-profile-ok',
            exitoso: true,
            mensajeUsuario: 'Información de perfil actualizada exitosamente en el sistema institucional.',
            datos: syncedUser,
          });
          subscriber.complete();
        })
        .catch((err) => {
          subscriber.error(err);
        });
    });
  }

  async fetchProfileFromBackend(token?: string): Promise<User | null> {
    if (this.mockModeSignal()) {
      return this.currentUser();
    }

    const authToken = token || this.token();
    if (!authToken) return null;

    try {
      const res = await fetch(`${environment.apiUrl}/usuarios/perfil`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const dbData = json.datos;
      if (!dbData) return null;

      const current = this.currentUser();
      if (!current) return null;

      const syncedUser: User = {
        ...current,
        primerNombre: dbData.primerNombre || current.primerNombre,
        segundoNombre: dbData.segundoNombre || current.segundoNombre,
        primerApellido: dbData.primerApellido || current.primerApellido,
        segundoApellido: dbData.segundoApellido || current.segundoApellido,
        numeroIdentificacion: dbData.numeroIdentificacion || current.numeroIdentificacion,
        name: dbData.name || current.name,
        email: dbData.email || dbData.correo || current.email,
        status: dbData.estado || current.status,
      };

      this.currentUser.set(syncedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(syncedUser));
      return syncedUser;
    } catch (e) {
      console.warn('No se pudo hidratar el perfil desde el backend:', e);
      return null;
    }
  }

  private mapPayloadToUser(payload: JwtTokenPayload): User {
    const realmRoles: string[] = payload.realm_access?.roles || [];
    const clientRoles: string[] = [
      ...(payload.resource_access?.['asistencias-api']?.roles || []),
      ...(payload.resource_access?.['asistencias-uco-frontend']?.roles || []),
    ];
    const allRoles = [...realmRoles, ...clientRoles];

    const validRoles: UserRole[] = ['ADMINISTRADOR', 'ADMIN', 'DECANO', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'];
    const matchedRole = validRoles.find((r) => allRoles.includes(r));
    const primaryRole = (matchedRole || 'DOCENTE') as UserRole;

    const fullName = [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
      payload.name ||
      payload.preferred_username ||
      'Usuario Institucional';

    return {
      id: payload.idUsuario || payload.sub || 'user-default',
      primerNombre: payload.given_name || fullName.split(' ')[0] || '',
      primerApellido: payload.family_name || fullName.split(' ')[1] || '',
      name: fullName,
      email: payload.email || `${payload.preferred_username || 'usuario'}@uco.edu.co`,
      role: primaryRole,
      institutionName: 'Universidad Católica de Oriente',
      department: this.getDepartmentForRole(primaryRole),
      status: 'active',
    };
  }

  private getDepartmentForRole(role: UserRole): string {
    switch (role) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return 'Administración Institucional';
      case 'DECANO':
        return 'Facultad de Ingeniería';
      case 'COORDINADOR':
        return 'Ingeniería de Sistemas';
      case 'DOCENTE':
        return 'Docencia Académica';
      case 'ESTUDIANTE':
        return 'Comunidad Estudiantil';
      default:
        return 'Comunidad Académica';
    }
  }
}
