import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, UserAuthResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_jwt_token';
  private readonly USER_KEY = 'auth_user_data';

  currentUser = signal<UserAuthResponse | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<ApiResponse<UserAuthResponse>> {
    const mockResponse: ApiResponse<UserAuthResponse> = {
      idTransaccion: 'mock-tx-login-001',
      exitoso: true,
      mensajeUsuario: '¡Autenticación exitosa! Bienvenido(a)',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_dra_maria_elena',
      datos: {
        id: 'E1F2A3B4-0000-0000-0000-000000000003',
        nombres: 'María Elena',
        apellidos: 'Rostagno Valencia',
        correo: correo || 'maria.rostagno@uco.edu.co',
        rol: 'DOCENTE',
      },
    };

    return of(mockResponse).pipe(
      delay(300),
      tap((res) => {
        if (res.exitoso && res.token) {
          this.setSession(res.token, res.datos);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private setSession(token: string, user: UserAuthResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  private getStoredToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UserAuthResponse | null {
    const data = sessionStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }
}
