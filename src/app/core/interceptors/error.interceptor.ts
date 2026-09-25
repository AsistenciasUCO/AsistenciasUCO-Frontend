import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.component';
import { getApiErrorMessage } from '../api/errors/api-error.util';

/**
 * Token de contexto para omitir la notificación global Toast cuando un componente
 * gestiona y presenta el error de forma local en su propia vista (evita doble notificación).
 */
export const BYPASS_GLOBAL_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const bypassGlobalToast = req.context.get(BYPASS_GLOBAL_ERROR_TOAST);

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
        if (!bypassGlobalToast) {
          toastService.error(getApiErrorMessage(error) || 'Acceso denegado: No cuenta con los permisos necesarios para realizar esta acción.');
        }
      } else if (error.status >= 500 && !bypassGlobalToast) {
        toastService.error(getApiErrorMessage(error));
      }

      return throwError(() => error);
    })
  );
};

