import { TestBed } from '@angular/core/testing';
import { provideRouter, type GuardResult, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { authGuard, guestGuard } from './auth.guard';
import { AuthStore } from './auth.store';

const setAuth = (store: InstanceType<typeof AuthStore>, authed: boolean): void => {
  if (authed) {
    localStorage.setItem('risu_auth_token', 'mock.token');
    localStorage.setItem(
      'risu_auth_user',
      JSON.stringify({ id: 'u', email: 'a@b.c', name: 'X', createdAt: '2020-01-01' }),
    );
    store.restoreSession();
  } else {
    localStorage.clear();
    store.logout();
  }
};

const runGuard = (fn: typeof authGuard | typeof guestGuard): GuardResult =>
  TestBed.runInInjectionContext(() =>
    fn({} as never, { url: '/x' } as never),
  ) as GuardResult;

describe('authGuard / guestGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('authGuard returns true when authenticated', () => {
    const store = TestBed.inject(AuthStore);
    setAuth(store, true);
    expect(runGuard(authGuard)).toBe(true);
  });

  it('authGuard redirects to /auth/login when not authenticated', () => {
    const store = TestBed.inject(AuthStore);
    setAuth(store, false);
    const result = runGuard(authGuard);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/auth/login']));
  });

  it('guestGuard returns true when NOT authenticated', () => {
    const store = TestBed.inject(AuthStore);
    setAuth(store, false);
    expect(runGuard(guestGuard)).toBe(true);
  });

  it('guestGuard redirects to /dashboard when authenticated', () => {
    const store = TestBed.inject(AuthStore);
    setAuth(store, true);
    const result = runGuard(guestGuard);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/dashboard']));
  });
});
