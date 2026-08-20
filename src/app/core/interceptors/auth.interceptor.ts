import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!isApiRequest(req.url) || !authService.isAuthenticated()) {
    return next(req);
  }

  return from(authService.refreshToken(30)).pipe(
    switchMap((refreshed) => {
      const token = refreshed ? authService.getAccessToken() : undefined;
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
