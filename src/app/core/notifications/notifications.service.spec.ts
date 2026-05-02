import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationsService } from './notifications.service';
import { SubscriptionsStore } from '@stores/subscriptions.store';
import { Subscription } from '@shared/models/subscription.model';

const isoIn = (days: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const sub = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'x',
  userId: 'u',
  name: 'Test',
  price: 100,
  currency: 'RUB',
  category: 'streaming',
  periodicity: 'monthly',
  nextPaymentDate: isoIn(2),
  notifyDaysBefore: 3,
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('NotificationsService.upcoming', () => {
  let store: InstanceType<typeof SubscriptionsStore>;
  let service: NotificationsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(SubscriptionsStore);
    service = TestBed.inject(NotificationsService);
  });

  const setItems = (items: Subscription[]): void => {
    patchState(unprotected(store), { items });
  };

  it('returns empty list for empty store', () => {
    expect(service.upcoming()).toEqual([]);
  });

  it('includes subscriptions due within notifyDaysBefore window', () => {
    setItems([
      sub({ id: 'soon', nextPaymentDate: isoIn(2), notifyDaysBefore: 3 }),
      sub({ id: 'later', nextPaymentDate: isoIn(10), notifyDaysBefore: 3 }),
    ]);
    const ids = service.upcoming().map((u) => u.subscriptionId);
    expect(ids).toEqual(['soon']);
  });

  it('excludes inactive subscriptions', () => {
    setItems([sub({ id: 'inactive', isActive: false, nextPaymentDate: isoIn(1) })]);
    expect(service.upcoming()).toEqual([]);
  });

  it('sorts by daysLeft ascending', () => {
    setItems([
      sub({ id: 'in-3', nextPaymentDate: isoIn(3), notifyDaysBefore: 5 }),
      sub({ id: 'in-1', nextPaymentDate: isoIn(1), notifyDaysBefore: 5 }),
      sub({ id: 'in-2', nextPaymentDate: isoIn(2), notifyDaysBefore: 5 }),
    ]);
    expect(service.upcoming().map((u) => u.subscriptionId)).toEqual(['in-1', 'in-2', 'in-3']);
  });
});
