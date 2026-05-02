import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MockDatabase } from './mock-database';
import { Subscription } from '@shared/models/subscription.model';

const STORAGE_KEY = 'risu_mock_db_v1';

const newSub = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'sub-1',
  userId: 'demo-user-id',
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

describe('MockDatabase', () => {
  let db: MockDatabase;

  beforeEach(() => {
    localStorage.clear();
    db = new MockDatabase();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('seeds demo user on first construction', () => {
    expect(db.findUserByEmail('demo@risu.app')).toBeDefined();
    expect(db.findUserByEmail('DEMO@RISU.APP')).toBeDefined();
  });

  it('persists state to localStorage', () => {
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('hashes passwords deterministically', () => {
    expect(db.hashPassword('demo1234')).toBe(db.hashPassword('demo1234'));
    expect(db.hashPassword('demo1234')).not.toBe(db.hashPassword('different'));
  });

  it('lists subscriptions only for the requested user', () => {
    const list = db.listSubscriptions('demo-user-id');
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((s) => s.userId === 'demo-user-id')).toBe(true);
    expect(db.listSubscriptions('unknown-user')).toEqual([]);
  });

  it('adds a subscription', () => {
    const before = db.listSubscriptions('demo-user-id').length;
    db.addSubscription(newSub({ id: 'new-id', name: 'Added' }));
    const after = db.listSubscriptions('demo-user-id');
    expect(after.length).toBe(before + 1);
    expect(after.find((s) => s.id === 'new-id')?.name).toBe('Added');
  });

  it('updates a subscription and returns the new value', () => {
    const updated = db.updateSubscription('demo-user-id', 'seed-1', { price: 999 });
    expect(updated?.price).toBe(999);
    expect(db.getSubscription('demo-user-id', 'seed-1')?.price).toBe(999);
  });

  it('returns null when updating a non-existent subscription', () => {
    expect(db.updateSubscription('demo-user-id', 'no-such-id', { price: 1 })).toBeNull();
  });

  it('deletes a subscription', () => {
    expect(db.deleteSubscription('demo-user-id', 'seed-1')).toBe(true);
    expect(db.getSubscription('demo-user-id', 'seed-1')).toBeUndefined();
  });

  it('reset() restores demo data', () => {
    db.deleteSubscription('demo-user-id', 'seed-1');
    db.reset();
    expect(db.listSubscriptions('demo-user-id').length).toBeGreaterThan(0);
    expect(db.findUserByEmail('demo@risu.app')).toBeDefined();
  });

  it('updateCategory changes monthlyLimit', () => {
    const updated = db.updateCategory('demo-user-id', 'streaming', { monthlyLimit: 1500 });
    expect(updated?.monthlyLimit).toBe(1500);
  });
});
