import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  let token = authService.token();

  if (!token && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('gestio_access_token');
    if (saved) {
      token = saved;
      authService.token.set(saved);
    }
  }

  // Si no estamos en modo mock y el token es un string mock heredado, limpiarlo
  if (token && !authService.isMockMode() && token.startsWith('mock-')) {
    authService.clearSession();
    return next(req);
  }

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
