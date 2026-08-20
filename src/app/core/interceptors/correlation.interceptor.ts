import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url) || req.headers.has('X-Correlation-Id')) {
    return next(req);
  }

  return next(
    req.clone({
      headers: req.headers.set('X-Correlation-Id', crypto.randomUUID()),
    })
  );
};

function isApiRequest(url: string): boolean {
  const requestUrl = new URL(url, window.location.origin);
  const apiUrl = new URL(environment.apiUrl, window.location.origin);
  return requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname);
}
