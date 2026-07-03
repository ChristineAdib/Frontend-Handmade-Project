import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/Services/auth';
import { AuthTokenService } from '../../auth/Services/auth-token.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const authTokenService = inject(AuthTokenService);
  const token = authTokenService.token();
  
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
        // Only force logout if the error response specifically indicates suspension/ban,
        // or if it's the check-status polling request itself.
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || '');
        const lowerMsg = errorMsg.toLowerCase();
        const isSuspensionMsg = lowerMsg.includes('suspended') || lowerMsg.includes('banned');
        const isCheckStatusUrl = req.url.includes('check-status');

        if (isSuspensionMsg || isCheckStatusUrl) {
          const authService = injector.get(AuthService);
          authService.forceLogoutBanned();
        }
      }

      if (err.status === 401) {
        const isBackendRequest = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/');
        if (isBackendRequest) {
          const authService = injector.get(AuthService);
          if (authService.isLoggedIn()) {
            authService.logout();
          }
        }
      }

      return throwError(() => err);
    })
  );
};