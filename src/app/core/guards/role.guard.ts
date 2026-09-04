import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as UserRole[] | undefined) || [];
  const currentUser = authService.currentUser();

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  // Normalizar rol
  const userRole = currentUser.role === 'ADMIN' ? 'ADMINISTRADOR' : currentUser.role;

  if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirigir a su vista inicial según su rol si no tiene permiso
  switch (userRole) {
    case 'ADMINISTRADOR':
      return router.createUrlTree(['/app/admin/decanos']);
    case 'DECANO':
      return router.createUrlTree(['/app/decano/coordinadores']);
    case 'COORDINADOR':
      return router.createUrlTree(['/app/coordinador/docentes']);
    case 'DOCENTE':
      return router.createUrlTree(['/app/docente/grupos']);
    case 'ESTUDIANTE':
      return router.createUrlTree(['/app/estudiante/horarios']);
    default:
      return router.createUrlTree(['/app/dashboard']);
  }
};
