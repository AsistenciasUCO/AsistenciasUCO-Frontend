import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { ApiResponse } from '../models/api-response.model';
import { User, UserRole } from '../models/user.model';
import { MOCK_USERS_BY_ROLE } from '../mocks/user.mock';
import { environment } from '../../../environments/environment';

const MOCK_STORAGE_KEY = 'gestio_asistencia_mock_role';

interface KeycloakTokenParsedDetails {
  idUsuario?: string;
  sub?: string;
  given_name?: string;
  preferred_username?: string;
  family_name?: string;
  email?: string;
  resource_access?: {
    [key: string]: {
      roles?: string[];
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloakInstance: Keycloak | null = null;

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.token());
  isMockMode = computed(() => environment.useMocks);

  constructor(private router: Router) {}

  async initKeycloak(): Promise<boolean> {
    if (environment.useMocks) {
      // In mock mode, restore previous mock session or initialize with Docente by default
      const savedRole = localStorage.getItem(MOCK_STORAGE_KEY) as UserRole | null;
      const initialRole: UserRole = savedRole && MOCK_USERS_BY_ROLE[savedRole] ? savedRole : 'DOCENTE';
      this.loginAsMockUser(initialRole, false);
      return true;
    }

    this.keycloakInstance = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });

    try {
      const authenticated = await this.keycloakInstance.init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });

      if (authenticated && this.keycloakInstance.token) {
        this.updateState();
      }

      return authenticated;
    } catch (error: unknown) {
      console.error('Error al inicializar Keycloak OIDC:', error);
      return false;
    }
  }

  async loginWithKeycloak(): Promise<void> {
    if (environment.useMocks) {
      this.loginAsMockUser('DOCENTE');
      return;
    }

    if (this.keycloakInstance) {
      await this.keycloakInstance.login({
        redirectUri: window.location.origin + '/app/dashboard',
        prompt: 'login',
      });
    }
  }

  loginAsMockUser(role: UserRole, navigateToApp: boolean = true): void {
    const selectedUser = MOCK_USERS_BY_ROLE[role] || MOCK_USERS_BY_ROLE.DOCENTE;
    this.currentUser.set(selectedUser);
    const mockToken = `mock-jwt-token-${role.toLowerCase()}-${selectedUser.id}`;
    this.token.set(mockToken);
    localStorage.setItem(MOCK_STORAGE_KEY, role);

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
    if (environment.useMocks) {
      return of({
        idTransaccion: 'mock-tx-login',
        exitoso: true,
        mensajeUsuario: 'Sesión iniciada en modo mock',
        datos: this.currentUser(),
      });
    }

    this.loginWithKeycloak();
    return of({
      idTransaccion: 'tx-keycloak-redirect',
      exitoso: true,
      mensajeUsuario: 'Redirigiendo a Keycloak para autenticación segura...',
      datos: null,
    });
  }

  async logout(): Promise<void> {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(MOCK_STORAGE_KEY);

    if (!environment.useMocks && this.keycloakInstance) {
      await this.keycloakInstance.logout({
        redirectUri: window.location.origin + '/login',
      });
    } else {
      this.router.navigate(['/login']);
    }
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

    this.currentUser.set(updatedUser);

    return of({
      idTransaccion: 'mock-tx-update-profile',
      exitoso: true,
      mensajeUsuario: 'Información de perfil actualizada exitosamente.',
      datos: updatedUser,
    });
  }

  private updateState(): void {
    if (!this.keycloakInstance || !this.keycloakInstance.token) return;

    const tokenStr = this.keycloakInstance.token;
    this.token.set(tokenStr);

    const tokenParsed = this.keycloakInstance.tokenParsed as KeycloakTokenParsedDetails | undefined;
    if (tokenParsed) {
      const roles: string[] = tokenParsed.resource_access?.['asistencias-api']?.roles || [];
      const primaryRole = (roles.length > 0 ? roles[0] : 'DOCENTE') as UserRole;

      const user: User = {
        id: tokenParsed.idUsuario || tokenParsed.sub || 'user-default',
        name: `${tokenParsed.given_name || 'Usuario'} ${tokenParsed.family_name || ''}`.trim(),
        email: tokenParsed.email || 'usuario@uco.edu.co',
        role: primaryRole,
        institutionName: 'UCO',
        department: 'Comunidad Académica',
        status: 'active',
      };

      this.currentUser.set(user);
    }
  }
}
