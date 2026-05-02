import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <main class="auth">
      <div class="auth__panel">
        <header class="auth__brand">
          <span class="auth__brand-mark" aria-hidden="true">R</span>
          <span class="auth__brand-text">Risu</span>
        </header>
        <p class="auth__lead">Менеджер подписок и регулярных платежей</p>
        <router-outlet />
      </div>
    </main>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .auth {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background:
          radial-gradient(circle at 10% 0%, rgb(93 62 255 / 0.08), transparent 40%),
          radial-gradient(circle at 90% 100%, rgb(0 199 168 / 0.08), transparent 40%),
          var(--tui-background-base, #fff);
      }
      .auth__panel {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .auth__brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 1.5rem;
      }
      .auth__brand-mark {
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        background: var(--tui-text-action, #5d3eff);
        color: white;
        display: grid;
        place-items: center;
        font-weight: 800;
      }
      .auth__lead {
        margin: 0;
        color: var(--tui-text-secondary, #5c6470);
      }
    `,
  ],
})
export class AuthShellComponent {}
