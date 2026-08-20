import { Injectable, computed, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { AuthenticatedUser } from '../models/api-response.model';

const VALID_API_ROLES = ['AD', 'DE', 'CD', 'DO', 'ES'] as const;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloakInstance: Keycloak | null = null;
  private authenticated = signal<boolean>(false);

  currentUser = signal<AuthenticatedUser | null>(null);
  isAuthenticated = computed(() => this.authenticated());

  async initKeycloak(): Promise<boolean> {
    if (!this.keycloakInstance) {
      this.keycloakInstance = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });
    }

    try {
      const authenticated = await this.keycloakInstance.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      });

      if (authenticated) {
        this.updateState();
      } else {
        this.clearSession();
      }

      return authenticated;
    } catch (error) {
      console.error('Error al inicializar Keycloak OIDC:', error);
      this.clearSession();
      return false;
    }
  }

  async loginWithKeycloak(returnUrl = '/app/dashboard'): Promise<void> {
    if (!this.keycloakInstance) {
      await this.initKeycloak();
    }

    await this.keycloakInstance?.login({
      redirectUri: window.location.origin + returnUrl,
      prompt: 'login',
    });
  }

  async logout(): Promise<void> {
    if (!this.keycloakInstance) {
      this.clearSession();
      return;
    }

    this.clearSession();
    await this.keycloakInstance.logout({
      redirectUri: window.location.origin + '/login',
    });
  }

  async refreshToken(minValidity = 30): Promise<boolean> {
    if (!this.keycloakInstance?.authenticated) {
      this.clearSession();
      return false;
    }

    try {
      await this.keycloakInstance.updateToken(minValidity);
      this.updateState();
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  clearSession(): void {
    this.currentUser.set(null);
    this.authenticated.set(false);
  }

  getAccessToken(): string | undefined {
    return this.keycloakInstance?.token;
  }

  // Client-side role checks are only for UX; Spring Security enforces real authorization.
  hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  // Client-side role checks are only for UX; Spring Security enforces real authorization.
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  private updateState(): void {
    if (!this.keycloakInstance?.token) {
      this.clearSession();
      return;
    }

    const tokenParsed = this.keycloakInstance.tokenParsed as any;
    if (!tokenParsed?.sub) {
      this.clearSession();
      return;
    }

    const apiRoles = tokenParsed.resource_access?.['asistencias-api']?.roles;
    const roles = Array.isArray(apiRoles)
      ? apiRoles.filter((role: string) => VALID_API_ROLES.includes(role as any))
      : [];

    this.currentUser.set({
      keycloakSub: tokenParsed.sub,
      idUsuario: tokenParsed.idUsuario,
      username: tokenParsed.preferred_username || '',
      nombres: tokenParsed.given_name || tokenParsed.preferred_username || '',
      apellidos: tokenParsed.family_name || '',
      correo: tokenParsed.email || '',
      roles,
    });
    this.authenticated.set(true);
  }
}
