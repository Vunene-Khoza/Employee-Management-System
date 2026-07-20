import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();
  const isBackendApi = req.url.startsWith('http://localhost:8080/api/');

  // Avoid adding custom headers to 3rd-party APIs (e.g. weather),
  // because they can trigger CORS preflight failures.
  let cloned = req;
  if (isBackendApi) {
    cloned = req.clone({
      headers: req.headers
        .set('Cache-Control', 'no-cache, no-store, must-revalidate')
        .set('Pragma', 'no-cache')
        .set('Expires', '0')
    });
  }

  if (token && isBackendApi){
    cloned = cloned.clone({
      headers: cloned.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return next(cloned);
};
