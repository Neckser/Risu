import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { AuthStore } from '@core/auth/auth.store';
import { NotificationsService } from '@core/notifications/notifications.service';
import { CategoriesStore } from '@stores/categories.store';
import { SubscriptionsStore } from '@stores/subscriptions.store';
import { CategoryLabelPipe } from '@shared/pipes/category-label.pipe';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    TuiButton,
    TuiIcon,
    PageHeaderComponent,
    StatCardComponent,
    CategoryLabelPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly subs = inject(SubscriptionsStore);
  private readonly cats = inject(CategoriesStore);
  private readonly auth = inject(AuthStore);
  private readonly notifications = inject(NotificationsService);

  readonly user = this.auth.user;
  readonly loading = this.subs.loading;
  readonly totalMonthly = this.subs.totalMonthlyCost;
  readonly totalYearly = this.subs.totalYearlyCost;
  readonly active = this.subs.activeItems;
  readonly upcoming = this.notifications.upcoming;
  readonly categories = this.cats.items;

  readonly topCategories = computed(() => {
    const spend = this.subs.spendByCategory();
    return [...spend.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  });

  readonly overLimitCount = computed(() => {
    const spend = this.subs.spendByCategory();
    return this.cats
      .items()
      .filter((c) => c.monthlyLimit != null && (spend.get(c.id) ?? 0) > c.monthlyLimit).length;
  });

  ngOnInit(): void {
    if (!this.subs.loaded()) this.subs.load();
    if (!this.cats.loaded()) this.cats.load();
  }
}
