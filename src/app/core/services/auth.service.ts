import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { ApiResponse, UserAuthResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloakInstance: Keycloak | null = null;

  currentUser = signal<UserAuthResponse | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.token());

  async initKeycloak(): Promise<boolean> {
    this.keycloakInstance = new Keycloak({
      url: 'http://127.0.0.1:8081',
      realm: 'asistencias-uco',
      clientId: 'asistencias-uco-frontend',
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
    } catch (error) {
      console.error('Error al inicializar Keycloak OIDC:', error);
      return false;
    }
  }

  async loginWithKeycloak(): Promise<void> {
    if (this.keycloakInstance) {
      await this.keycloakInstance.login({
        redirectUri: window.location.origin + '/app/dashboard',
        prompt: 'login',
      });
    }
  }

  login(correo?: string, contrasena?: string): Observable<ApiResponse<UserAuthResponse>> {
    this.loginWithKeycloak();
    return of({
      idTransaccion: 'tx-keycloak-redirect',
      exitoso: true,
      mensajeUsuario: 'Redirigiendo a Keycloak para autenticación segura...',
      datos: undefined as any,
    });
  }

  async logout(): Promise<void> {
    if (this.keycloakInstance) {
      this.token.set(null);
      this.currentUser.set(null);
      await this.keycloakInstance.logout({
        redirectUri: window.location.origin + '/login',
      });
    }
  }

  private updateState(): void {
    if (!this.keycloakInstance || !this.keycloakInstance.token) return;

    const tokenStr = this.keycloakInstance.token;
    this.token.set(tokenStr);

    const tokenParsed = this.keycloakInstance.tokenParsed as any;
    if (tokenParsed) {
      const roles: string[] = tokenParsed.resource_access?.['asistencias-api']?.roles || [];
      const primaryRole = roles.length > 0 ? roles[0] : 'DOCENTE';

      this.currentUser.set({
        id: tokenParsed.idUsuario || tokenParsed.sub,
        nombres: tokenParsed.given_name || tokenParsed.preferred_username || 'Usuario',
        apellidos: tokenParsed.family_name || '',
        correo: tokenParsed.email || '',
        rol: primaryRole,
      });
    }
  }
}
