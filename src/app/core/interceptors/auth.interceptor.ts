import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!isApiRequest(req.url)) {
    return next(req);
  }

  // Limpia tokens mock heredados si ya no estamos en modo mock.
  const currentToken = authService.token();
  if (currentToken && !authService.isMockMode() && currentToken.startsWith('mock-')) {
    authService.clearSession();
    return next(req);
  }

  if (authService.isMockMode()) {
    return currentToken
      ? next(
          req.clone({
            headers: req.headers.set('Authorization', `Bearer ${currentToken}`),
          })
        )
      : next(req);
  }

  if (!authService.isAuthenticated()) {
    return next(req);
  }

  return from(authService.getValidAccessToken(30)).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      return next(
        req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      );
    })
  );
};

function isApiRequest(url: string): boolean {
  const requestUrl = new URL(url, window.location.origin);
  const apiUrl = new URL(environment.apiUrl, window.location.origin);
  return requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname);
}
