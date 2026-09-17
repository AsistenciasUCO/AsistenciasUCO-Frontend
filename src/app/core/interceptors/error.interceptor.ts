import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.component';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        const isAuxiliary =
          req.url.includes('/usuarios/perfil') ||
          req.url.includes('/openid-connect/token');

        if (authService.isAuthenticated() && !isAuxiliary) {
          // Intentar un refresh transparente antes de forzar el cierre de sesión
          authService.refreshAccessToken().then((refreshed) => {
            if (!refreshed) {
              authService.clearSession();
              if (!router.url.startsWith('/login')) {
                router.navigate(['/login'], {
                  queryParams: { returnUrl: router.url },
                });
              }
            }
          });
        }
      } else if (error.status === 403) {
        toastService.error('Acceso denegado: No cuenta con los permisos necesarios para realizar esta acción.');
      }

      return throwError(() => error);
    })
  );
};
