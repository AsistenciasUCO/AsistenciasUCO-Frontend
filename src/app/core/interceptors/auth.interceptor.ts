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
            withCredentials: true,
            headers: req.headers.set('Authorization', `Bearer ${currentToken}`),
          })
        )
      : next(req.clone({ withCredentials: true }));
  }

  if (!authService.isAuthenticated()) {
    return next(req.clone({ withCredentials: true }));
  }

  return from(authService.getValidAccessToken(30)).pipe(
    switchMap((token) => {
      const activeToken = token || authService.token();
      if (!activeToken) {
        return next(req.clone({ withCredentials: true }));
      }

      return next(
        req.clone({
          withCredentials: true,
          headers: req.headers.set('Authorization', `Bearer ${activeToken}`),
        })
      );
    })
  );
};

function normalizeHost(hostname: string): string {
  return hostname === '127.0.0.1' ? 'localhost' : hostname;
}

function isApiRequest(url: string): boolean {
  try {
    const requestUrl = new URL(url, window.location.origin);
    const apiUrl = new URL(environment.apiUrl, window.location.origin);
    return (
      requestUrl.protocol === apiUrl.protocol &&
      normalizeHost(requestUrl.hostname) === normalizeHost(apiUrl.hostname) &&
      requestUrl.port === apiUrl.port &&
      requestUrl.pathname.startsWith(apiUrl.pathname)
    );
  } catch {
    return false;
  }
}
