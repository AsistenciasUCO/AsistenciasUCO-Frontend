import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        if (authService.isAuthenticated() && !req.url.includes('/openid-connect/token')) {
          authService.clearSession();
          if (!router.url.startsWith('/login')) {
            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url },
            });
          }
        }
      }

      return throwError(() => error);
    })
  );
};
