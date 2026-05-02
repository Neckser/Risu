import { describe, expect, it } from 'vitest';

import { MonthlyCostPipe } from './monthly-cost.pipe';

const pipe = new MonthlyCostPipe();

describe('MonthlyCostPipe', () => {
  it('keeps monthly price as-is', () => {
    expect(pipe.transform({ price: 599, periodicity: 'monthly' })).toBe(599);
  });

  it('divides yearly price by 12', () => {
    expect(pipe.transform({ price: 1200, periodicity: 'yearly' })).toBe(100);
  });

  it('divides quarterly price by 3', () => {
    expect(pipe.transform({ price: 900, periodicity: 'quarterly' })).toBe(300);
  });

  it('multiplies weekly price up to ~4.345 weeks', () => {
    const result = pipe.transform({ price: 100, periodicity: 'weekly' });
    expect(result).toBeGreaterThan(400);
    expect(result).toBeLessThan(450);
  });
});
