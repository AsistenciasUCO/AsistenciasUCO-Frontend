import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.component';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Las rutas auxiliares (perfil, token endpoint) no deben destruir la sesión
        // ante un 401 parcial — el AuthInterceptor ya maneja la renovación.
        const isAuxiliary =
          req.url.includes('/usuarios/perfil') ||
          req.url.includes('/openid-connect/token');

        if (authService.isAuthenticated() && !isAuxiliary) {
          // Notificar expiración: limpia estado, emite al BroadcastChannel y redirige.
          authService.notifySessionExpired();
        }
      } else if (error.status === 403) {
        toastService.error('Acceso denegado: No cuenta con los permisos necesarios para realizar esta acción.');
      }

      return throwError(() => error);
    })
  );
};

