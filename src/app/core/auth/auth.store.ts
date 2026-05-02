import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { pipe, switchMap, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { AuthService } from './auth.service';
import { RegisterPayload, User, UserCredentials } from './models/user.model';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!token() && !!user()),
  })),
  withMethods((store) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const login = rxMethod<UserCredentials>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((creds) =>
          auth.login(creds).pipe(
            tap({
              next: (res) => {
                patchState(store, {
                  user: res.user,
                  token: res.token,
                  loading: false,
                  error: null,
                });
                void router.navigate(['/dashboard']);
              },
              error: (err: Error) => patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    );

    const register = rxMethod<RegisterPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          auth.register(payload).pipe(
            tap({
              next: (res) => {
                patchState(store, {
                  user: res.user,
                  token: res.token,
                  loading: false,
                  error: null,
                });
                void router.navigate(['/dashboard']);
              },
              error: (err: Error) => patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    );

    const logout = (): void => {
      auth.logout();
      patchState(store, { ...initialState });
      void router.navigate(['/auth/login']);
    };

    const restoreSession = (): void => {
      const token = auth.loadStoredToken();
      const user = auth.loadStoredUser();
      if (token && user) {
        patchState(store, { token, user });
      }
    };

    return { login, register, logout, restoreSession };
  }),
  withHooks({
    onInit(store) {
      store.restoreSession();
    },
  }),
);
