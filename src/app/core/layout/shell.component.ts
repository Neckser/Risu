import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadgeNotification } from '@taiga-ui/kit';

import { AuthStore } from '@core/auth/auth.store';
import { NotificationsService } from '@core/notifications/notifications.service';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

const NAV: readonly NavLink[] = [
  { path: '/dashboard', label: 'Дашборд', icon: '@tui.layout-dashboard' },
  { path: '/subscriptions', label: 'Подписки', icon: '@tui.list' },
  { path: '/categories', label: 'Категории', icon: '@tui.tag' },
  { path: '/settings', label: 'Настройки', icon: '@tui.settings' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TuiButton, TuiIcon, TuiBadgeNotification],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthStore);
  private readonly notifications = inject(NotificationsService);

  readonly nav = NAV;
  readonly user = this.auth.user;
  readonly upcomingCount = computed(() => this.notifications.upcoming().length);

  logout(): void {
    this.auth.logout();
  }
}
