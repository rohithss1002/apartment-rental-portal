import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const accessToken = localStorage.getItem('access_token');

  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          logout(router);
          return throwError(() => err);
        }

        return http.post<any>('http://localhost:5000/refresh', {}).pipe(
          switchMap(res => {
            localStorage.setItem('access_token', res.access_token);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.access_token}`
              }
            });

            return next(retryReq);
          }),
          catchError(() => {
            logout(router);
            return throwError(() => err);
          })
        );
      }

      return throwError(() => err);
    })
  );
};

function logout(router: Router) {
  localStorage.clear();
  router.navigate(['/login']);
}
