import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (store.isAuthenticated()) return true;
  return router.createUrlTree(['/auth/login']);
};

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isAuthenticated()) return true;
  return router.createUrlTree(['/dashboard']);
};
