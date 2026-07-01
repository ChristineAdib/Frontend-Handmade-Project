import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/Services/auth';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  const lang = (() => {
    try {
      return localStorage.getItem('lang') || 'en';
    } catch {
      return 'en';
    }
  })();

  const headers: { [header: string]: string } = {
    'Accept-Language': lang
  };

  if (environment.authMode === 'bearer' && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  req = req.clone({ 
    setHeaders: headers,
    withCredentials: true 
  });

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 403) {
        authService.forceLogoutBanned();
      }
      return throwError(() => err);
    })
  );
};