import { describe, expect, it } from 'vitest';

import { DaysUntilPipe } from './days-until.pipe';

const pipe = new DaysUntilPipe();

const isoFromOffsetDays = (offset: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

describe('DaysUntilPipe', () => {
  it('returns "—" for null/undefined/empty input', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });

  it('returns "—" for invalid date string', () => {
    expect(pipe.transform('not-a-date')).toBe('—');
  });

  it('returns "Сегодня" for today', () => {
    expect(pipe.transform(isoFromOffsetDays(0))).toBe('Сегодня');
  });

  it('returns "Завтра" for tomorrow', () => {
    expect(pipe.transform(isoFromOffsetDays(1))).toBe('Завтра');
  });

  it('returns "Через N дн." for the next 6 days', () => {
    expect(pipe.transform(isoFromOffsetDays(3))).toBe('Через 3 дн.');
    expect(pipe.transform(isoFromOffsetDays(6))).toBe('Через 6 дн.');
  });

  it('returns "Через N нед." for ranges 7..29 days ahead', () => {
    expect(pipe.transform(isoFromOffsetDays(7))).toBe('Через 1 нед.');
    expect(pipe.transform(isoFromOffsetDays(14))).toBe('Через 2 нед.');
  });

  it('returns "N дн. назад" for past dates', () => {
    expect(pipe.transform(isoFromOffsetDays(-2))).toBe('2 дн. назад');
  });

  it('accepts a Date object', () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    expect(pipe.transform(d)).toBe('Сегодня');
  });
});
