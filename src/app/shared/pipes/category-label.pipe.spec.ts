import { describe, expect, it } from 'vitest';

import { CategoryLabelPipe } from './category-label.pipe';
import { Category, DEFAULT_CATEGORIES } from '../models/category.model';

const pipe = new CategoryLabelPipe();

describe('CategoryLabelPipe', () => {
  it('returns label from default categories when no list provided', () => {
    expect(pipe.transform('streaming')).toBe('Стриминг');
    expect(pipe.transform('gaming')).toBe('Игры');
  });

  it('uses the provided list when passed', () => {
    const custom: Category[] = [
      { id: 'streaming', label: 'Custom streaming', icon: '@tui.tv', monthlyLimit: null },
      ...DEFAULT_CATEGORIES.filter((c) => c.id !== 'streaming'),
    ];
    expect(pipe.transform('streaming', custom)).toBe('Custom streaming');
  });

  it('falls back to default categories when an empty list is provided (not yet loaded)', () => {
    expect(pipe.transform('streaming', [])).toBe('Стриминг');
  });

  it('returns id verbatim when id is not present in the non-empty provided list', () => {
    const list: Category[] = [
      { id: 'gaming', label: 'Игры', icon: '@tui.gamepad-2', monthlyLimit: null },
    ];
    expect(pipe.transform('streaming', list)).toBe('streaming');
  });
});
