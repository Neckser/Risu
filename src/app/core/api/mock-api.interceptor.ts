import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

import { API_BASE_URL, MOCK_NETWORK_DELAY_MS } from './api.config';
import { MockDatabase } from './mock/mock-database';
import { AuthResponse } from '@core/auth/models/auth.model';
import { User, UserCredentials, RegisterPayload } from '@core/auth/models/user.model';
import {
  Subscription,
  SubscriptionDraft,
} from '@shared/models/subscription.model';
import { Category } from '@shared/models/category.model';

const TOKEN_PREFIX = 'mock.';

const dbSingleton = new MockDatabase();

const ok = <T>(body: T, status = 200): Observable<HttpEvent<T>> =>
  of(new HttpResponse({ body, status })).pipe(delay(MOCK_NETWORK_DELAY_MS));

const fail = (status: number, message: string): Observable<never> =>
  defer(() =>
    throwError(() => new HttpErrorResponse({ status, error: { message }, statusText: message })),
  ).pipe(delay(MOCK_NETWORK_DELAY_MS));

const decodeToken = (token: string | null): string | null => {
  if (!token || !token.startsWith(TOKEN_PREFIX)) return null;
  try {
    return atob(token.slice(TOKEN_PREFIX.length));
  } catch {
    return null;
  }
};

const buildToken = (userId: string): string => `${TOKEN_PREFIX}${btoa(userId)}`;

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const requireUserId = (auth: string | null): Observable<string> => {
  const userId = decodeToken(auth?.replace(/^Bearer\s+/i, '') ?? null);
  if (!userId || !dbSingleton.findUserById(userId)) {
    return fail(401, 'Не авторизован');
  }
  return of(userId);
};

const stripPassword = ({ id, email, name, createdAt }: { id: string; email: string; name: string; createdAt: string }): User =>
  ({ id, email, name, createdAt });

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  inject; // keep DI ergonomics; not strictly needed

  const path = req.url.slice(API_BASE_URL.length);
  const auth = req.headers.get('Authorization');

  // ---------- AUTH ----------
  if (path === '/auth/login' && req.method === 'POST') {
    const body = req.body as UserCredentials;
    if (!body?.email || !body?.password) return fail(400, 'Email и пароль обязательны');
    const user = dbSingleton.findUserByEmail(body.email);
    if (!user || user.passwordHash !== dbSingleton.hashPassword(body.password)) {
      return fail(401, 'Неверный email или пароль');
    }
    const response: AuthResponse = { token: buildToken(user.id), user: stripPassword(user) };
    return ok(response);
  }

  if (path === '/auth/register' && req.method === 'POST') {
    const body = req.body as RegisterPayload;
    if (!body?.email || !body?.password || !body?.name) {
      return fail(400, 'Заполните все поля');
    }
    if (dbSingleton.findUserByEmail(body.email)) {
      return fail(409, 'Пользователь с таким email уже существует');
    }
    const user = {
      id: newId(),
      email: body.email,
      name: body.name,
      createdAt: new Date().toISOString(),
      passwordHash: dbSingleton.hashPassword(body.password),
    };
    dbSingleton.addUser(user);
    const response: AuthResponse = { token: buildToken(user.id), user: stripPassword(user) };
    return ok(response, 201);
  }

  if (path === '/auth/me' && req.method === 'GET') {
    return requireUserId(auth).pipe(
      mergeMap((userId) => {
        const user = dbSingleton.findUserById(userId);
        if (!user) return fail(404, 'Пользователь не найден');
        return ok(stripPassword(user));
      }),
    );
  }

  // ---------- SUBSCRIPTIONS ----------
  if (path === '/subscriptions' && req.method === 'GET') {
    return requireUserId(auth).pipe(
      mergeMap((userId) => ok(dbSingleton.listSubscriptions(userId))),
    );
  }

  if (path === '/subscriptions' && req.method === 'POST') {
    return requireUserId(auth).pipe(
      mergeMap((userId) => {
        const draft = req.body as SubscriptionDraft;
        if (!draft?.name || draft?.price == null) return fail(400, 'Название и цена обязательны');
        const sub: Subscription = {
          ...draft,
          id: newId(),
          userId,
          createdAt: new Date().toISOString(),
        };
        return ok(dbSingleton.addSubscription(sub), 201);
      }),
    );
  }

  const subIdMatch = path.match(/^\/subscriptions\/([^/]+)$/);
  if (subIdMatch) {
    const id = subIdMatch[1];
    return requireUserId(auth).pipe(
      mergeMap((userId) => {
        if (req.method === 'GET') {
          const sub = dbSingleton.getSubscription(userId, id);
          return sub ? ok(sub) : fail(404, 'Подписка не найдена');
        }
        if (req.method === 'PUT' || req.method === 'PATCH') {
          const updated = dbSingleton.updateSubscription(userId, id, req.body as Partial<Subscription>);
          return updated ? ok(updated) : fail(404, 'Подписка не найдена');
        }
        if (req.method === 'DELETE') {
          return dbSingleton.deleteSubscription(userId, id)
            ? ok({ deleted: true })
            : fail(404, 'Подписка не найдена');
        }
        return fail(405, 'Метод не поддерживается');
      }),
    );
  }

  // ---------- CATEGORIES ----------
  if (path === '/categories' && req.method === 'GET') {
    return requireUserId(auth).pipe(mergeMap((userId) => ok(dbSingleton.listCategories(userId))));
  }

  const categoryIdMatch = path.match(/^\/categories\/([^/]+)$/);
  if (categoryIdMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
    const id = categoryIdMatch[1];
    return requireUserId(auth).pipe(
      mergeMap((userId) => {
        const updated = dbSingleton.updateCategory(userId, id, req.body as Partial<Category>);
        return updated ? ok(updated) : fail(404, 'Категория не найдена');
      }),
    );
  }

  return fail(404, `Маршрут не найден: ${req.method} ${path}`);
};

export const __mockDb = dbSingleton;
