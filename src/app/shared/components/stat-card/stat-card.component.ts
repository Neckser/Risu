import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon],
  template: `
    <article class="stat" [attr.aria-label]="label()">
      <header class="stat__header">
        <tui-icon [icon]="icon()" class="stat__icon" />
        <span class="stat__label">{{ label() }}</span>
      </header>
      <div class="stat__value">
        <ng-content />
      </div>
      @if (hint(); as h) {
        <div class="stat__hint">{{ h }}</div>
      }
    </article>
  `,
  styles: [
    `
      :host { display: block; height: 100%; }
      .stat {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        height: 100%;
        padding: 1.25rem;
        background: var(--tui-background-base, #fff);
        border: 1px solid var(--tui-border-normal, #e6e8eb);
        border-radius: 1rem;
        box-shadow: 0 4px 12px -8px rgb(15 17 20 / 0.08);
      }
      .stat__header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--tui-text-secondary, #5c6470);
        font-size: 0.875rem;
      }
      .stat__icon {
        color: var(--tui-text-action, #5d3eff);
      }
      .stat__value {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.1;
      }
      .stat__hint {
        font-size: 0.75rem;
        color: var(--tui-text-secondary, #5c6470);
      }
    `,
  ],
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly icon = input<string>('@tui.activity');
  readonly hint = input<string | null>(null);
}
