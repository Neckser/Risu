import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { CategoriesStore } from '@stores/categories.store';
import {
  SortDir,
  SortKey,
  SubscriptionsStore,
} from '@stores/subscriptions.store';
import { CategoryId } from '@shared/models/category.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SubscriptionCardComponent } from '../components/subscription-card.component';

interface SortOption {
  value: string;
  key: SortKey;
  dir: SortDir;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'date-asc', key: 'date', dir: 'asc', label: 'По дате (раньше)' },
  { value: 'date-desc', key: 'date', dir: 'desc', label: 'По дате (позже)' },
  { value: 'price-desc', key: 'price', dir: 'desc', label: 'По цене (дороже)' },
  { value: 'price-asc', key: 'price', dir: 'asc', label: 'По цене (дешевле)' },
  { value: 'name-asc', key: 'name', dir: 'asc', label: 'По названию (А→Я)' },
  { value: 'category-asc', key: 'category', dir: 'asc', label: 'По категории' },
];

@Component({
  selector: 'app-subscriptions-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TuiButton,
    TuiIcon,
    PageHeaderComponent,
    SubscriptionCardComponent,
  ],
  templateUrl: './subscriptions-list.component.html',
  styleUrl: './subscriptions-list.component.scss',
})
export class SubscriptionsListComponent implements OnInit {
  private readonly subs = inject(SubscriptionsStore);
  private readonly cats = inject(CategoriesStore);

  readonly items = this.subs.visibleItems;
  readonly loading = this.subs.loading;
  readonly loaded = this.subs.loaded;
  readonly categories = this.cats.items;
  readonly totalCount = computed(() => this.subs.items().length);

  readonly searchInput = signal('');
  readonly categoryInput = signal<CategoryId | ''>('');
  readonly statusInput = signal<'all' | 'active' | 'inactive'>('all');
  readonly sortInput = signal<string>(SORT_OPTIONS[0].value);

  readonly sortOptions = SORT_OPTIONS;

  ngOnInit(): void {
    if (!this.subs.loaded()) this.subs.load();
    if (!this.cats.loaded()) this.cats.load();
  }

  onSearch(value: string): void {
    this.searchInput.set(value);
    this.subs.setSearch(value);
  }

  onCategory(value: CategoryId | ''): void {
    this.categoryInput.set(value);
    this.subs.setFilterCategory(value === '' ? null : value);
  }

  onStatus(value: 'all' | 'active' | 'inactive'): void {
    this.statusInput.set(value);
    this.subs.setFilterStatus(value);
  }

  onSort(value: string): void {
    this.sortInput.set(value);
    const opt = SORT_OPTIONS.find((o) => o.value === value);
    if (opt) this.subs.setSort(opt.key, opt.dir);
  }

  toggle(id: string): void {
    this.subs.toggleActive(id);
  }

  remove(id: string): void {
    if (confirm('Удалить эту подписку?')) {
      this.subs.remove(id);
    }
  }

  reset(): void {
    this.onSearch('');
    this.onCategory('');
    this.onStatus('all');
    this.onSort(SORT_OPTIONS[0].value);
  }
}
