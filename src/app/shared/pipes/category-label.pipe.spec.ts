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

  it('returns id verbatim if not present in list', () => {
    expect(pipe.transform('streaming', [])).toBe('streaming');
  });
});
