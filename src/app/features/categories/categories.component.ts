import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon } from '@taiga-ui/core';

import { CategoriesStore } from '@stores/categories.store';
import { SubscriptionsStore } from '@stores/subscriptions.store';
import { Category, CategoryId } from '@shared/models/category.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, FormsModule, TuiIcon, PageHeaderComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly cats = inject(CategoriesStore);
  private readonly subs = inject(SubscriptionsStore);

  readonly categories = this.cats.items;

  readonly viewModel = computed(() => {
    const spend = this.subs.spendByCategory();
    const counts = this.subs.countByCategory();
    return this.categories().map((c) => {
      const monthly = spend.get(c.id) ?? 0;
      const limit = c.monthlyLimit;
      const ratio = limit && limit > 0 ? monthly / limit : 0;
      return {
        category: c,
        monthly,
        count: counts.get(c.id) ?? 0,
        limit,
        ratio: Math.min(ratio, 1.5),
        exceeded: limit != null && monthly > limit,
      };
    });
  });

  ngOnInit(): void {
    if (!this.cats.loaded()) this.cats.load();
    if (!this.subs.loaded()) this.subs.load();
  }

  setLimit(id: CategoryId, value: string): void {
    const num = Number(value);
    const monthlyLimit = !value || Number.isNaN(num) || num <= 0 ? null : num;
    this.cats.setLimit({ id, monthlyLimit });
  }

  trackId(_: number, c: Category): CategoryId {
    return c.id;
  }
}
