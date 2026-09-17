import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, from, switchMap, filter, take, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// ─────────────────────────────────────────────────────────────────────────────
// Cola anti-race-condition para renovaciones de token concurrentes.
// Estas variables viven fuera de la función (módulo-scope) para que sean
// compartidas entre todas las invocaciones del interceptor funcional.
// ─────────────────────────────────────────────────────────────────────────────
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

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
      return next(attachToken(req, activeToken));
    }),
    catchError((err) => {
      if (err?.status === 401) {
        return handle401(req, next, authService);
      }
      return throwError(() => err);
    })
  );
};

/**
 * Maneja un 401 inesperado tras enviar el token.
 * Serializa la renovación con BehaviorSubject para que las peticiones
 * concurrentes no disparen múltiples refreshes ("tormenta de renovaciones").
 */
function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Bloquear la cola mientras renovamos

    return from(authService.refreshAccessToken()).pipe(
      switchMap((refreshed) => {
        isRefreshing = false;
        if (refreshed) {
          const newToken = authService.token();
          refreshTokenSubject.next(newToken);
          if (!newToken) {
            authService.notifySessionExpired();
            return throwError(() => new Error('Token renovado pero no disponible'));
          }
          return next(attachToken(req, newToken));
        } else {
          refreshTokenSubject.next(null);
          authService.notifySessionExpired();
          return throwError(() => new Error('No se pudo renovar el token de sesión'));
        }
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.notifySessionExpired();
        return throwError(() => err);
      })
    );
  }

  // Otra petición ya está renovando: encolar y esperar el nuevo token.
  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(attachToken(req, token!)))
  );
}

function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    withCredentials: true,
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });
}

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
