import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiAlertService, TuiButton, TuiIcon } from '@taiga-ui/core';

import { AuthStore } from '@core/auth/auth.store';
import { __mockDb } from '@core/api/mock-api.interceptor';
import { SubscriptionsStore } from '@stores/subscriptions.store';
import { CategoriesStore } from '@stores/categories.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TuiButton, TuiIcon, PageHeaderComponent],
  styleUrl: './settings.component.scss',
  template: `
    <app-page-header title="Настройки" subtitle="Аккаунт и сервисные действия" />

    <section class="card" aria-labelledby="account-heading">
      <h2 id="account-heading" class="card__title">Аккаунт</h2>
      @if (user(); as u) {
        <dl class="account">
          <dt>Имя</dt><dd>{{ u.name }}</dd>
          <dt>Email</dt><dd>{{ u.email }}</dd>
          <dt>Создан</dt><dd>{{ u.createdAt | date: 'dd MMM yyyy' }}</dd>
        </dl>
      }
      <button tuiButton type="button" appearance="secondary" (click)="logout()">
        Выйти из аккаунта
      </button>
    </section>

    <section class="card" aria-labelledby="data-heading">
      <h2 id="data-heading" class="card__title">Данные</h2>
      <p class="card__hint">
        Все данные приложения хранятся локально в браузере (mock-сервер).
        Сброс удалит подписки, категории и пользователей и вернёт демо-данные.
      </p>
      <button tuiButton type="button" appearance="flat-destructive" (click)="reset()">
        <tui-icon icon="@tui.refresh-cw" />
        Сбросить данные
      </button>
    </section>
  `,
})
export class SettingsComponent {
  private readonly authStore = inject(AuthStore);
  private readonly subs = inject(SubscriptionsStore);
  private readonly cats = inject(CategoriesStore);
  private readonly alerts = inject(TuiAlertService);

  readonly user = this.authStore.user;

  logout(): void {
    this.authStore.logout();
  }

  reset(): void {
    if (!confirm('Точно сбросить все данные? Это действие нельзя отменить.')) return;
    __mockDb.reset();
    this.subs.reset();
    this.cats.reset();
    this.authStore.logout();
    this.alerts
      .open('Данные сброшены. Войдите снова — demo@risu.app / demo1234.', { appearance: 'positive' })
      .subscribe();
  }
}
