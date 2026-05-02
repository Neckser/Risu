import { Pipe, PipeTransform } from '@angular/core';

import { Category, CategoryId, DEFAULT_CATEGORIES } from '../models/category.model';

@Pipe({ name: 'categoryLabel', standalone: true, pure: true })
export class CategoryLabelPipe implements PipeTransform {
  transform(id: CategoryId, categories?: readonly Category[] | null): string {
    const list = categories?.length ? categories : DEFAULT_CATEGORIES;
    return list.find((c) => c.id === id)?.label ?? id;
  }
}
