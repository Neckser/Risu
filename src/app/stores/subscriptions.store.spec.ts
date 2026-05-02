import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { beforeEach, describe, expect, it } from 'vitest';

import { SubscriptionsStore } from './subscriptions.store';
import { Subscription } from '@shared/models/subscription.model';

const sub = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'id-1',
  userId: 'u',
  name: 'Test',
  price: 100,
  currency: 'RUB',
  category: 'streaming',
  periodicity: 'monthly',
  nextPaymentDate: new Date().toISOString(),
  notifyDaysBefore: 3,
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('SubscriptionsStore (computed/state)', () => {
  let store: InstanceType<typeof SubscriptionsStore>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(SubscriptionsStore);
  });

  it('starts with empty state', () => {
    expect(store.items()).toEqual([]);
    expect(store.totalMonthlyCost()).toBe(0);
    expect(store.activeItems()).toEqual([]);
  });

  it('totalMonthlyCost sums monthly equivalents of active items only', () => {
    patchState(store, {
      items: [
        sub({ id: '1', price: 599, periodicity: 'monthly' }),
        sub({ id: '2', price: 1200, periodicity: 'yearly' }), // = 100/мес
        sub({ id: '3', price: 999, periodicity: 'monthly', isActive: false }), // skipped
      ],
    });
    expect(store.totalMonthlyCost()).toBe(699);
  });

  it('totalYearlyCost is 12x the monthly cost', () => {
    patchState(store, { items: [sub({ price: 100, periodicity: 'monthly' })] });
    expect(store.totalYearlyCost()).toBe(1200);
  });

  it('search filters visibleItems by name (case-insensitive)', () => {
    patchState(store, {
      items: [sub({ id: '1', name: 'Netflix' }), sub({ id: '2', name: 'Spotify' })],
    });
    store.setSearch('net');
    expect(store.visibleItems().map((s) => s.id)).toEqual(['1']);
  });

  it('category filter removes items in other categories', () => {
    patchState(store, {
      items: [
        sub({ id: '1', category: 'streaming' }),
        sub({ id: '2', category: 'gaming' }),
      ],
    });
    store.setFilterCategory('gaming');
    expect(store.visibleItems().map((s) => s.id)).toEqual(['2']);
  });

  it('status filter excludes inactive items when "active"', () => {
    patchState(store, {
      items: [
        sub({ id: '1', isActive: true }),
        sub({ id: '2', isActive: false }),
      ],
    });
    store.setFilterStatus('active');
    expect(store.visibleItems().map((s) => s.id)).toEqual(['1']);
  });

  it('sort by price asc/desc reorders the list', () => {
    patchState(store, {
      items: [
        sub({ id: 'cheap', price: 100, periodicity: 'monthly' }),
        sub({ id: 'mid', price: 500, periodicity: 'monthly' }),
        sub({ id: 'pricey', price: 1000, periodicity: 'monthly' }),
      ],
    });
    store.setSort('price', 'asc');
    expect(store.visibleItems().map((s) => s.id)).toEqual(['cheap', 'mid', 'pricey']);
    store.setSort('price', 'desc');
    expect(store.visibleItems().map((s) => s.id)).toEqual(['pricey', 'mid', 'cheap']);
  });

  it('countByCategory and spendByCategory aggregate active items', () => {
    patchState(store, {
      items: [
        sub({ id: '1', category: 'streaming', price: 599 }),
        sub({ id: '2', category: 'streaming', price: 269 }),
        sub({ id: '3', category: 'gaming', price: 100 }),
        sub({ id: '4', category: 'streaming', price: 999, isActive: false }),
      ],
    });
    expect(store.countByCategory().get('streaming')).toBe(2);
    expect(store.countByCategory().get('gaming')).toBe(1);
    expect(store.spendByCategory().get('streaming')).toBe(599 + 269);
  });
});
