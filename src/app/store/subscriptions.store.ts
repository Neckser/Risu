import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { computed, effect } from '@angular/core';
import { Subscription } from '../shared/models/subscription.model';

export interface SubscriptionsState {
  items: Subscription[];
  loading: boolean;
}

const initialState: SubscriptionsState = {
  items: [],
  loading: false,
};

export const SubscriptionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items }) => ({
    totalMonthlyCost: computed(() =>
      items()
        .filter(s => s.isActive)
        .reduce((sum, sub) => sum + Number(sub.price), 0)
    ),
  })),
  withMethods((store) => ({
    addSubscription(subscription: Subscription) {
      patchState(store, (state) => ({
        items: [...state.items, subscription]
      }));
    },
    removeSubscription(id: string) {
      patchState(store, (state) => ({
        items: state.items.filter(s => s.id !== id)
      }));
    },
    toggleStatus(id: string) {
      patchState(store, (state) => ({
        items: state.items.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
      }));
    },
    loadFromStorage() {
      const saved = localStorage.getItem('risu_subs');
      if (saved) {
        patchState(store, { items: JSON.parse(saved) });
      }
    }
  })),
  withHooks({
    onInit(store) {
      store.loadFromStorage();
      effect(() => {
        localStorage.setItem('risu_subs', JSON.stringify(store.items()));
      });
    },
  })
);