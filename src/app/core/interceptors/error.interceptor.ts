import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.component';
import { API_ERROR_CODE, getApiErrorCode } from '../api/errors/api-error.util';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      // Se decide por ApiErrorResponse.code (o su equivalente derivado del
      // status cuando la cadena de seguridad responde sin envelope), nunca
      // por el texto del mensaje.
      if (getApiErrorCode(error) === API_ERROR_CODE.FORBIDDEN) {
        toastService.error('Acceso denegado: No cuenta con los permisos necesarios para realizar esta acción.');
      }

      return throwError(() => error);
    })
  );
};
