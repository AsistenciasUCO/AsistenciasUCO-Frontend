import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Espejo de las reglas por prefijo de `SecurityConfig` (backend). Las lecturas (GET) de un prefijo que el rol
 * autenticado no puede usar se cortan en el cliente con un 403 local: la pantalla recibe el mismo error de siempre,
 * pero sin una peticion que el servidor rechazaria (ruido de 403 en la red y en los logs de seguridad).
 *
 * El backend sigue siendo la autoridad: solo se interceptan GET, nunca escrituras, y un rol sin sesion o
 * un prefijo desconocido pasan sin cambios.
 */
export const ROLE_SCOPE_RULES: ReadonlyArray<{ prefix: string; roles: readonly UserRole[] }> = [
  { prefix: 'admin', roles: ['ADMINISTRADOR'] },
  { prefix: 'decano', roles: ['DECANO', 'ADMINISTRADOR'] },
  { prefix: 'coordinador', roles: ['COORDINADOR', 'ADMINISTRADOR'] },
  { prefix: 'docente', roles: ['DOCENTE'] },
  { prefix: 'docentes', roles: ['COORDINADOR', 'ADMINISTRADOR'] },
  { prefix: 'estudiante', roles: ['ESTUDIANTE'] },
  { prefix: 'estudiantes', roles: ['DOCENTE', 'COORDINADOR', 'ADMINISTRADOR'] },
];

function normalizarRol(role: UserRole): UserRole {
  return role === 'ADMIN' ? 'ADMINISTRADOR' : role;
}

/** Primer segmento de la ruta relativa a `apiUrl`, o `null` si la URL no es del API v1. */
function primerSegmentoApi(url: string): string | null {
  try {
    const request = new URL(url, window.location.origin);
    const api = new URL(environment.apiUrl, window.location.origin);
    const base = `${api.pathname.replace(/\/+$/, '')}/`;
    if (request.origin !== api.origin || !request.pathname.startsWith(base)) {
      return null;
    }
    return request.pathname.slice(base.length).split('/')[0] || null;
  } catch {
    return null;
  }
}

export function rolPuedeLeer(role: UserRole, segmento: string): boolean {
  const regla = ROLE_SCOPE_RULES.find((r) => r.prefix === segmento);
  return !regla || regla.roles.includes(normalizarRol(role));
}

export const roleScopeInterceptor: HttpInterceptorFn = (req, next) => {
  // En baseline los roles del navegador son solo una ayuda de navegación y no
  // pueden convertirse en una decisión local de autorización. El PEP decide.
  if (environment.security.provider === 'baseline') {
    return next(req);
  }
  if (req.method !== 'GET') {
    return next(req);
  }
  const usuario = inject(AuthService).currentUser();
  const segmento = primerSegmentoApi(req.url);
  if (!usuario || segmento === null || rolPuedeLeer(usuario.role, segmento)) {
    return next(req);
  }
  return throwError(
    () => new HttpErrorResponse({ status: 403, statusText: 'Forbidden', url: req.url })
  );
};
