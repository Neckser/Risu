import { HttpInterceptorFn } from '@angular/common/http';

import { API_BASE_URL } from '@core/api/api.config';
import { AUTH_TOKEN_STORAGE_KEY } from './auth.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL) || req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  let token: string | null = null;
  try {
    token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    token = null;
  }

  if (!token) return next(req);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
