import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TuiAlertService } from '@taiga-ui/core';
import { catchError, throwError } from 'rxjs';

const extractMessage = (err: HttpErrorResponse): string => {
  if (typeof err.error === 'string') return err.error;
  if (err.error && typeof err.error === 'object' && 'message' in err.error) {
    return String((err.error as { message: unknown }).message);
  }
  return err.message || 'Произошла неизвестная ошибка';
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alerts = inject(TuiAlertService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = extractMessage(err);

      if (err.status === 401 && !req.url.endsWith('/auth/login')) {
        try {
          localStorage.removeItem('risu_auth_token');
        } catch {
          // storage may be unavailable
        }
        void router.navigate(['/auth/login']);
      } else {
        alerts.open(message, { appearance: 'negative', label: 'Ошибка' }).subscribe();
      }

      return throwError(() => err);
    }),
  );
};
