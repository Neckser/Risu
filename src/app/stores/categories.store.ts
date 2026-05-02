import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import { API_PATHS } from '@core/api/api.config';
import { Category, CategoryId } from '@shared/models/category.model';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  loaded: false,
};

export const CategoriesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);

    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          http.get<Category[]>(API_PATHS.categories).pipe(
            tap({
              next: (items) =>
                patchState(store, { items, loading: false, loaded: true, error: null }),
              error: (err: Error) =>
                patchState(store, { loading: false, error: err.message, loaded: true }),
            }),
          ),
        ),
      ),
    );

    const setLimit = rxMethod<{ id: CategoryId; monthlyLimit: number | null }>(
      pipe(
        switchMap(({ id, monthlyLimit }) =>
          http.put<Category>(API_PATHS.categoryById(id), { monthlyLimit }).pipe(
            tap({
              next: (updated) =>
                patchState(store, (s) => ({
                  items: s.items.map((c) => (c.id === id ? updated : c)),
                })),
              error: (err: Error) => patchState(store, { error: err.message }),
            }),
          ),
        ),
      ),
    );

    const reset = (): void => patchState(store, initialState);

    return { load, setLimit, reset };
  }),
);
