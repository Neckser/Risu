import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_PATHS } from '@core/api/api.config';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from './auth.tokens';
import { AuthResponse } from './models/auth.model';
import { RegisterPayload, User, UserCredentials } from './models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(API_PATHS.authLogin, credentials)
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(API_PATHS.authRegister, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  me(): Observable<User> {
    return this.http.get<User>(API_PATHS.authMe);
  }

  logout(): void {
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
      // storage may be unavailable
    }
  }

  loadStoredToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persist(res: AuthResponse): void {
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, res.token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(res.user));
    } catch {
      // ignore quota issues
    }
  }
}
