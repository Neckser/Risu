import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { Category } from '@shared/models/category.model';
import { Subscription } from '@shared/models/subscription.model';
import { CategoryLabelPipe } from '@shared/pipes/category-label.pipe';
import { DaysUntilPipe } from '@shared/pipes/days-until.pipe';

@Component({
  selector: 'app-subscription-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    TuiButton,
    TuiIcon,
    CategoryLabelPipe,
    DaysUntilPipe,
  ],
  template: `
    <article class="card" [class.card--inactive]="!sub().isActive">
      <a [routerLink]="['/subscriptions', sub().id]" class="card__main">
        <div class="card__avatar" aria-hidden="true">
          {{ sub().name.charAt(0).toUpperCase() }}
        </div>
        <div class="card__body">
          <div class="card__name">{{ sub().name }}</div>
          <div class="card__meta">
            {{ sub().category | categoryLabel: categories() }}
            · {{ sub().nextPaymentDate | daysUntil }}
          </div>
        </div>
      </a>

      <div class="card__price">
        {{ sub().price | currency: sub().currency : 'symbol-narrow' : '1.0-2' }}
        <span class="card__period">/ {{ shortPeriod() }}</span>
      </div>

      <div class="card__actions">
        <button
          tuiButton
          type="button"
          appearance="secondary"
          size="s"
          (click)="toggle.emit(sub().id)"
          [attr.aria-label]="sub().isActive ? 'Деактивировать' : 'Активировать'"
        >
          {{ sub().isActive ? 'Пауза' : 'Включить' }}
        </button>
        <button
          tuiButton
          type="button"
          appearance="flat-destructive"
          size="s"
          (click)="remove.emit(sub().id)"
          aria-label="Удалить подписку"
        >
          <tui-icon icon="@tui.trash-2" />
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      :host { display: block; }
      .card {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 1rem;
        background: var(--tui-background-base, #fff);
        border: 1px solid var(--tui-border-normal, #e6e8eb);
        border-radius: 0.875rem;
        transition: opacity 0.15s ease, transform 0.15s ease;

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }

        &--inactive { opacity: 0.55; }
      }
      .card__main {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: inherit;
        min-width: 0;
      }
      .card__avatar {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        background: var(--tui-background-accent-1, rgb(93 62 255 / 0.12));
        color: var(--tui-text-action, #5d3eff);
        display: grid;
        place-items: center;
        font-weight: 700;
      }
      .card__body { flex: 1; min-width: 0; }
      .card__name {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .card__meta {
        color: var(--tui-text-secondary, #5c6470);
        font-size: 0.85rem;
      }
      .card__price {
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .card__period {
        font-weight: 400;
        color: var(--tui-text-secondary, #5c6470);
        font-size: 0.8rem;
      }
      .card__actions { display: flex; gap: 0.5rem; }
    `,
  ],
})
export class SubscriptionCardComponent {
  readonly sub = input.required<Subscription>();
  readonly categories = input<readonly Category[] | null>(null);

  readonly toggle = output<string>();
  readonly remove = output<string>();

  shortPeriod(): string {
    const map = { weekly: 'нед', monthly: 'мес', quarterly: 'кв', yearly: 'год' };
    return map[this.sub().periodicity];
  }
}
