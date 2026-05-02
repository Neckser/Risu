import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle(); as s) {
          <p class="page-header__subtitle">{{ s }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .page-header__text { flex: 1 1 auto; min-width: 0; }
      .page-header__title { margin: 0; font-size: 1.75rem; font-weight: 700; }
      .page-header__subtitle {
        margin: 0.25rem 0 0;
        color: var(--tui-text-secondary, #5c6470);
        font-size: 0.95rem;
      }
      .page-header__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    `,
  ],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
