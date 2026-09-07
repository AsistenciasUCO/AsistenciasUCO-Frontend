import { Injectable, computed, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import {
  ApiRole,
  AuthenticatedUser,
} from '../models/authenticated-user.model';

const VALID_API_ROLES: readonly ApiRole[] = ['AD', 'DE', 'CD', 'DO', 'ES'];

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
  hasRole(role: ApiRole): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  // Client-side role checks are only for UX; Spring Security enforces real authorization.
  hasAnyRole(roles: ApiRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  private updateState(): void {
    if (!this.keycloakInstance?.token) {
      this.clearSession();
      return;
    }

    const tokenParsed: unknown = this.keycloakInstance.tokenParsed;
    const sub = this.readStringClaim(tokenParsed, 'sub');
    const idUsuario = this.readStringClaim(tokenParsed, 'idUsuario');

    if (!sub || !idUsuario) {
      this.clearSession();
      return;
    }

    const username = this.readStringClaim(tokenParsed, 'preferred_username');
    const givenName = this.readStringClaim(tokenParsed, 'given_name');
    const familyName = this.readStringClaim(tokenParsed, 'family_name');
    const email = this.readStringClaim(tokenParsed, 'email');
    const roles = this.extractApiRoles(tokenParsed);

    this.currentUser.set({
      keycloakSub: sub,
      idUsuario,
      username: username ?? '',
      nombres: givenName ?? username ?? '',
      apellidos: familyName ?? '',
      correo: email ?? '',
      roles,
    });
    this.authenticated.set(true);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private readStringClaim(
    tokenParsed: unknown,
    claimName: string
  ): string | undefined {
    if (!this.isRecord(tokenParsed)) {
      return undefined;
    }

    const value = tokenParsed[claimName];
    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private extractApiRoles(tokenParsed: unknown): ApiRole[] {
    if (!this.isRecord(tokenParsed)) {
      return [];
    }

    const resourceAccess = tokenParsed['resource_access'];
    if (!this.isRecord(resourceAccess)) {
      return [];
    }

    const apiAccess = resourceAccess['asistencias-api'];
    if (!this.isRecord(apiAccess)) {
      return [];
    }

    const roles = apiAccess['roles'];
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles.filter((role): role is ApiRole => this.isApiRole(role));
  }

  private isApiRole(value: unknown): value is ApiRole {
    return (
      typeof value === 'string' &&
      VALID_API_ROLES.some((role) => role === value)
    );
  }
}
