import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import { API_PATHS } from '@core/api/api.config';
import {
  PERIODICITY_MONTHS,
  Subscription,
  SubscriptionDraft,
} from '@shared/models/subscription.model';
import { CategoryId } from '@shared/models/category.model';

export type SortKey = 'name' | 'price' | 'date' | 'category';
export type SortDir = 'asc' | 'desc';

interface SubscriptionsState {
  items: Subscription[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  search: string;
  filterCategory: CategoryId | null;
  filterStatus: 'all' | 'active' | 'inactive';
  sortKey: SortKey;
  sortDir: SortDir;
}

const initialState: SubscriptionsState = {
  items: [],
  loading: false,
  error: null,
  loaded: false,
  search: '',
  filterCategory: null,
  filterStatus: 'all',
  sortKey: 'date',
  sortDir: 'asc',
};

const monthlyAmount = (s: Subscription): number =>
  s.price / Math.max(PERIODICITY_MONTHS[s.periodicity], 0.0001);

export const SubscriptionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    activeItems: computed(() => state.items().filter((s) => s.isActive)),
    totalMonthlyCost: computed(() =>
      state
        .items()
        .filter((s) => s.isActive)
        .reduce((sum, s) => sum + monthlyAmount(s), 0),
    ),
    totalYearlyCost: computed(() =>
      state
        .items()
        .filter((s) => s.isActive)
        .reduce((sum, s) => sum + monthlyAmount(s) * 12, 0),
    ),
    countByCategory: computed(() => {
      const map = new Map<CategoryId, number>();
      for (const s of state.items()) {
        if (!s.isActive) continue;
        map.set(s.category, (map.get(s.category) ?? 0) + 1);
      }
      return map;
    }),
    spendByCategory: computed(() => {
      const map = new Map<CategoryId, number>();
      for (const s of state.items()) {
        if (!s.isActive) continue;
        map.set(s.category, (map.get(s.category) ?? 0) + monthlyAmount(s));
      }
      return map;
    }),
    visibleItems: computed(() => {
      const q = state.search().trim().toLowerCase();
      const cat = state.filterCategory();
      const status = state.filterStatus();
      const filtered = state.items().filter((s) => {
        if (q && !s.name.toLowerCase().includes(q)) return false;
        if (cat && s.category !== cat) return false;
        if (status === 'active' && !s.isActive) return false;
        if (status === 'inactive' && s.isActive) return false;
        return true;
      });
      const dir = state.sortDir() === 'asc' ? 1 : -1;
      const key = state.sortKey();
      return [...filtered].sort((a, b) => {
        switch (key) {
          case 'name':
            return a.name.localeCompare(b.name) * dir;
          case 'price':
            return (monthlyAmount(a) - monthlyAmount(b)) * dir;
          case 'date':
            return (
              (new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()) *
              dir
            );
          case 'category':
            return a.category.localeCompare(b.category) * dir;
        }
      });
    }),
  })),
  withMethods((store) => {
    const http = inject(HttpClient);

    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          http.get<Subscription[]>(API_PATHS.subscriptions).pipe(
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

    const create = rxMethod<SubscriptionDraft>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((draft) =>
          http.post<Subscription>(API_PATHS.subscriptions, draft).pipe(
            tap({
              next: (created) =>
                patchState(store, (s) => ({
                  items: [...s.items, created],
                  loading: false,
                })),
              error: (err: Error) =>
                patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    );

    const update = rxMethod<{ id: string; patch: Partial<Subscription> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, patch }) =>
          http.put<Subscription>(API_PATHS.subscriptionById(id), patch).pipe(
            tap({
              next: (updated) =>
                patchState(store, (s) => ({
                  items: s.items.map((it) => (it.id === id ? updated : it)),
                  loading: false,
                })),
              error: (err: Error) =>
                patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    );

    const remove = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          http.delete<{ deleted: boolean }>(API_PATHS.subscriptionById(id)).pipe(
            tap({
              next: () =>
                patchState(store, (s) => ({
                  items: s.items.filter((it) => it.id !== id),
                  loading: false,
                })),
              error: (err: Error) =>
                patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    );

    const toggleActive = (id: string): void => {
      const item = store.items().find((s) => s.id === id);
      if (!item) return;
      update({ id, patch: { isActive: !item.isActive } });
    };

    const setSearch = (search: string): void => patchState(store, { search });
    const setFilterCategory = (filterCategory: CategoryId | null): void =>
      patchState(store, { filterCategory });
    const setFilterStatus = (filterStatus: 'all' | 'active' | 'inactive'): void =>
      patchState(store, { filterStatus });
    const setSort = (sortKey: SortKey, sortDir: SortDir = 'asc'): void =>
      patchState(store, { sortKey, sortDir });
    const reset = (): void => patchState(store, initialState);

    return {
      load,
      create,
      update,
      remove,
      toggleActive,
      setSearch,
      setFilterCategory,
      setFilterStatus,
      setSort,
      reset,
    };
  }),
);
